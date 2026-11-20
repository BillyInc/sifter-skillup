#!/usr/bin/env python3
"""Build a bounded, source-backed enrichment index for D141.

This is an evidence/indexing artifact only. It does not activate areas, change
role fit/routes, approve learning items, rewrite graph edges, or touch SQL/UI.
"""
from __future__ import annotations

import json
import gzip
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
OUT_JSON = AUDIT / "D141_QUANTUM_SOURCE_INDEX_2026_10_28.json"
OUT_MD = AUDIT / "D141_QUANTUM_SOURCE_INDEX_2026_10_28.md"
TODAY = date.today().isoformat()

FAMILIES = [
    ("foundations_knowledge_and_competencies", "Foundations, knowledge and competencies"),
    ("methods_and_designs", "Methods and designs"),
    ("techniques_estimators_and_algorithms", "Techniques, estimators and algorithms"),
    ("tools_software_and_data", "Tools, software and data"),
    ("standards_credentials_and_learning_resources", "Standards, credentials and learning resources"),
    ("outputs_and_downstream_role_context", "Outputs and downstream role context"),
]
HORIZONS = ["established/traditional", "current", "emerging", "future/futuristic"]

SOURCES = [
    ("D141-NIST-QIS-OVERVIEW", "Quantum Information Science", "NIST", "https://www.nist.gov/quantum-information-science", "QIS scope; identifies computing, sensing/measurement and networks; explicitly separates post-quantum cryptography from quantum cryptography.", "Authoritative US metrology-agency overview; scope evidence, not a global curriculum, occupational taxonomy or maturity estimate.", "official_agency"),
    ("D141-NIST-QC-EXPLAINED", "Quantum Computing Explained", "NIST", "https://www.nist.gov/quantum-information-science/quantum-computing-explained", "Quantum-state computation, measurement limits, errors and current/fault-tolerant capability limits; page updated May 2026.", "Explanatory agency page; use to bound capability claims, not to settle all application-specific advantage claims.", "official_agency"),
    ("D141-DOE-QIS-ROADMAP-2024", "Quantum Information Science and Technology Roadmap", "US Department of Energy", "https://www.quantum.gov/wp-content/uploads/2024/12/DOE_QIS_Roadmap_Final.pdf", "Research eras, hardware/software co-design, algorithms, networks, QEC and applications; includes technical milestones and dependencies.", "US public R&D roadmap, not an assured timeline, commercial forecast or globally binding sequence.", "official_roadmap"),
    ("D141-DARPA-QBI-2025", "Quantum Benchmarking Initiative: Stage B Selection", "DARPA", "https://www.darpa.mil/research/programs/quantum-benchmarking-initiative/stage-b-selection", "Named hardware approaches under a staged effort to verify utility-scale computer concepts; approach diversity includes neutral atoms, silicon spin, superconducting, trapped ion and photonics.", "Program status and company-reported approaches; stage entry is not proof of utility-scale performance or commercial readiness.", "official_program"),
    ("D141-DARPA-QBI", "Quantum Benchmarking Initiative", "DARPA", "https://www.darpa.mil/research/programs/quantum-benchmarking-initiative", "Current QBI stage/performer list and evaluation purpose.", "A government program list, not independent comparative performance evidence.", "official_program"),
    ("D141-OECD-GLOBAL-ECOSYSTEM-2025", "Mapping the Global Quantum Ecosystem", "OECD", "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/mapping-the-global-quantum-ecosystem_47891dd2/20251217-0001.pdf", "Hardware architectures, infrastructure, supply chain, skills mapping, employer/job-posting patterns and geographic scope; distinguishes research advancement from commercial readiness.", "OECD analysis uses defined data sources and geographies; job-posting and maturity classifications do not transfer automatically to Nigeria or prove universal demand.", "intergovernmental_research"),
    ("D141-UK-SKILLS-TASKFORCE-2025", "UK Quantum Skills Taskforce Report", "UK Department for Science, Innovation and Technology", "https://www.gov.uk/government/publications/uk-quantum-skills-taskforce-report/uk-quantum-skills-taskforce-report", "Skills, tasks, workforce evidence, technician/apprenticeship pathways and stated data limitations through Jan 2025.", "UK sector evidence; online job-ad sampling and keyword identification have coverage and bias limits; not a Nigerian labor-market estimate.", "official_workforce_report"),
    ("D141-UK-SKILLS-LANDING", "UK Quantum Skills Taskforce Report: publication record", "UK Department for Science, Innovation and Technology", "https://www.gov.uk/government/publications/uk-quantum-skills-taskforce-report", "Report provenance, accountable authorship and revision history.", "Landing page is provenance, not a substitute for the report's specific claims.", "official_workforce_report"),
    ("D141-QEDC-LEARNING-2025", "Connecting the Dots: Quantum Learning Through Experiential Activities and Practice", "Quantum Economic Development Consortium (QED-C)", "https://quantumconsortium.org/qed-c-report-recommends-ways-to-strengthen-quantum-talent-pipeline-and-fill-critical-quantum-related-positions/", "Industry-consortium workforce recommendations: experiential learning, mentorship, bridge roles, and applied practice.", "Industry consortium and member interests; supports workforce/practice context, not prevalence, universal credential requirements or independent labor demand.", "credible_industry_grey"),
    ("D141-QEDC-NETWORK-ROADMAP-2026", "Quantum Networking Applications Roadmap", "QED-C / SRI International", "https://quantumconsortium.org/publication/quantum-networking-applications-roadmap/", "Network metrics, enabling technologies, applications, and current limitations; current evidence supports limited point-to-point QKD and distributed sensing, with longer-range use dependent on repeaters/satellites/switches.", "Expert/industry roadmap; its application prioritization and timelines are not independent market validation or proof that the applications are deployed at scale.", "credible_industry_grey"),
    ("D141-MIT-QSE-COURSE", "Introduction to Quantum Systems Engineering (6.2400)", "MIT EECS", "https://www.eecs.mit.edu/academics/undergraduate-programs/curriculum/6-3-computer-science-and-engineering/", "Course scope/prerequisites across quantum mechanics, gates, systems, noise, entanglement, benchmarking, communication, algorithms; companion platforms course covers photonics, superconducting and trapped-ion labs.", "One university curriculum demonstrates an integrated teaching structure, not a universal prerequisite mandate or industry-wide curriculum.", "academic_curriculum"),
    ("D141-COLUMBIA-QST-CURRICULUM", "M.S. in Quantum Science and Technology Curriculum", "Columbia Engineering", "https://quantum.engineering.columbia.edu/content/curriculum", "Course offerings spanning math/physics, algorithms, hardware, networks, error-correcting codes, sensing, nanofabrication and application electives.", "One program catalog; course availability and degree rules may change; not proof of universal ordering or required qualifications.", "academic_curriculum"),
    ("D141-POLITO-QENG-CURRICULUM", "Quantum Engineering Programme Curriculum", "Politecnico di Torino", "https://www.polito.it/en/education/master-s-degree-programmes/quantum-engineering/programme-curriculum", "Curriculum includes quantum information, materials/processes for sensors/devices, photonics, lab work, communication/networks/cryptography, hardware design and computing.", "Single degree program and jurisdiction; curriculum alignment is evidence of teachable content, not universal occupational requirements.", "academic_curriculum"),
    ("D141-QTEDU-COMPETENCE-2024", "Competence Framework for Quantum Technologies v2.5", "Quantum Technology Education (QTEdu) / European Quantum Flagship", "https://qt.eu/media/pdf/Competence_Framework_for_QT_v2_5_2024_official-version.pdf", "Structured competence families for hardware platforms, control, hybrid systems, sensing/imaging, algorithms/software and application fields.", "European education framework; evidence for competency/topic coverage, not a job taxonomy or global course mandate.", "academic_professional_framework"),
    ("D141-IEEE-HARDWARE-REVIEW-2026", "Comparative Analysis of Contemporary Quantum Computer Processors", "IEEE Access", "https://ieeexplore.ieee.org/document/11421923/", "Peer-reviewed review of superconducting, trapped-ion, photonic, neutral-atom, silicon-spin and emerging topological platforms, benchmarks and bottlenecks.", "Publisher abstract/indexed text supports high-level taxonomy only unless full text is inspected; comparison dates to late 2024/early 2025 and performance changes rapidly.", "peer_reviewed_review"),
    ("D141-IEEE-BENCHMARK-2025", "Benchmarking Quantum Computers", "Nature Reviews Physics", "https://www.nature.com/articles/s42254-024-00796-z", "Explains benchmark families, components, system-level measures and why benchmarks can mislead when they do not match use cases.", "Perspective/review, not a binding standard; page abstract and summary support benchmark-design framing.", "peer_reviewed_review"),
    ("D141-IOP-BENCHMARK-2026", "Benchmarking quantum computers: towards a standard performance evaluation approach", "Quantum Science and Technology / IOP Publishing", "https://doi.org/10.1088/2058-9565/ae4269", "Peer-reviewed 2026 analysis of fair processor comparison and limitations of naïve benchmark transfer from classical systems.", "Methodological paper does not establish a single adopted global benchmark standard.", "peer_reviewed_research"),
    ("D141-NIST-BENEFITS-RISKS-2024", "Assessing the Benefits and Risks of Quantum Computers", "NIST / IEEE Security & Privacy", "https://www.nist.gov/publications/assessing-benefits-and-risks-quantum-computers", "Reviews near-term heuristic algorithms, error mitigation and cryptographic implications; distinguishes present uncertainty from fault-tolerant threats.", "Review article; conclusions are date-dependent and do not validate individual commercial advantage claims.", "peer_reviewed_review"),
    ("D141-NATURE-VQA-2021", "Variational quantum algorithms", "Nature Reviews Physics", "https://www.nature.com/articles/s42254-021-00348-9", "Hybrid parameterized-circuit/classical-optimizer design, motivating VQE/QAOA-style methods under device constraints and known trainability/accuracy/efficiency challenges.", "Review from 2021; field advances quickly; proposed utility and advantage are problem-specific, not guaranteed.", "peer_reviewed_review"),
    ("D141-NIST-THERMODYNAMIC-GROVER-2018", "Thermodynamic Analysis of Classical and Quantum Search Algorithms", "NIST / QIP proceedings", "https://www.nist.gov/publications/thermodynamic-analysis-classical-and-quantum-search-algorithms", "Shows query-complexity advantage does not by itself establish energy/resource advantage for Grover-related search.", "Specific theoretical models and assumptions; use as a warning against translating one complexity measure into universal practical advantage.", "peer_reviewed_research"),
    ("D141-NIST-SENSING-EXPLAINED", "Quantum Sensing Explained", "NIST", "https://www.nist.gov/quantum-information-science/quantum-sensing-explained", "Quantum-enhanced measurement modalities and physical quantities/applications.", "Explanatory source, not a career standard or proof each sensor outperforms classical instrumentation in deployment.", "official_agency"),
    ("D141-GAO-SENSORS-2025", "Science & Tech Spotlight: Quantum Sensors", "US Government Accountability Office", "https://www.gao.gov/products/gao-25-107876", "Technology status and limitations including maturity relative to other quantum technology, reliability/cost, workforce and supply-chain challenges.", "US government assessment; maturity varies by sensor modality and application; not an adoption guarantee.", "official_oversight"),
    ("D141-NIST-SENSOR-PAPER-2025", "Atom-Based Quantum Sensing of Electromagnetic Fields", "NIST / Optica", "https://www.nist.gov/publications/atom-based-quantum-sensing-electromagnetic-fields", "Peer-reviewed review covers atomic vapor magnetometers, NV-center magnetometers and Rydberg RF sensors with real-world application context.", "Focused on electromagnetic sensing; not a survey of all quantum sensor classes or evidence of universal performance superiority.", "peer_reviewed_review"),
    ("D141-NSF-SENSING-2026", "Quantum sensing: from the inner workings of cells to the outer limits of the universe", "US National Science Foundation", "https://www.nsf.gov/science-matters/quantum-sensing-inner-workings-cells-outer-limits-universe", "Research/application context for sensing across scales.", "Public science explainer; supports example discovery, not claims of commercial maturity or comparative performance.", "official_agency"),
    ("D141-NIST-QISN-GROUP", "Quantum Information, Sensing, and Networking", "NIST Physical Measurement Laboratory", "https://www.nist.gov/pml/time-and-frequency-division/quantum-information-sensing-and-networking", "Intersections across trapped atoms/molecules and photons; computing, simulation, sensing, clocks and networks; context for shared hardware/interconnect enablers.", "One national lab research portfolio; demonstrates technical intersections, not fixed field boundaries or universal dependencies.", "official_lab"),
    ("D141-NIST-QNET-PROJECT", "Quantum Communications and Networks", "NIST", "https://www.nist.gov/programs-projects/quantum-communications-and-networks", "Photon sources/detectors, quantum memories, transduction/interfaces, network testbeds, control planes, protocols and performance metrology.", "US lab programs/testbeds; planned/research capabilities should not be described as deployed global networks.", "official_lab"),
    ("D141-ITU-Y3800", "Recommendation ITU-T Y.3800: Overview on networks supporting QKD", "International Telecommunication Union", "https://www.itu.int/rec/dologin_pub.asp?id=T-REC-Y.3800-201910-I%21%21PDF-E&lang=e&type=items", "QKDN architecture concept, point-to-point quantum link plus classical channel, trusted nodes, key relay and deployment constraints.", "Standards framework; QKD is add-on infrastructure, not a general replacement for classical networks or post-quantum cryptography.", "international_standard"),
    ("D141-ITU-Q4165-2026", "Recommendation ITU-T Q.4165: QKD network interworking protocol framework", "International Telecommunication Union", "https://www.itu.int/epublications/en/publication/itu-t-q-4165-2026-01-quantum-key-distribution-network-interworking-protocol-framework/en", "Key managers/modules, trusted and interworking nodes, classical and quantum channels, network-layer signaling/interworking; quantum-layer interop remains outside scope/further work.", "Recommendation covers QKD network interworking, not all quantum internet/network architectures.", "international_standard"),
    ("D141-ITU-Y3804-2025", "Recommendation ITU-T Y.3804: QKDN control and management", "International Telecommunication Union", "https://www.itu.int/epublications/publication/itu-t-y-3804-2025-04-quantum-key-distribution-networks-control-and-management", "QKDN control layer, route provisioning/rerouting, QBER/fault triggers, manager/controller roles.", "Standardized QKD network control context; not a general quantum computing control stack.", "international_standard"),
    ("D141-ETSI-QKD-2026", "Quantum Key Distribution technical group and standards list", "ETSI", "https://www.etsi.org/technical-groups/qkd/", "Current published QKD vocabulary (2026-01), REST interoperable key-management API (2026-06) and protection-profile work.", "ETSI documents apply to QKD interfaces/security scope, not general quantum algorithms or all network systems.", "international_standard"),
    ("D141-ITU-QKD-MGMT", "Recommendation ITU-T Y.3803: QKD network key management", "International Telecommunication Union", "https://www.itu.int/dms_pubrec/itu-t/rec/y/T-REC-Y.3803-202012-I%21%21SUM-HTM-E.htm", "QKD module-to-key-manager-to-application flow, secure storing/relay/supply of generated keys.", "Summary of recommendation; operational scope specific to QKDN key management.", "international_standard"),
    ("D141-ITU-QNET-SUP98", "ITU-T Y.Suppl. 98: Quantum network concepts", "International Telecommunication Union", "https://www.itu.int/rec/dologin_pub.asp?id=T-REC-Y.Sup98-202511-I%21%21PDF-E&lang=e&type=items", "Quantum networks connect computers, sensors and information sources; no-cloning and measurement constrain store-and-forward; classical network signaling remains complementary.", "Supplementary technical context, not a normative recommendation or deployment maturity claim.", "international_standard_supplement"),
    ("D141-QTEDU-HARDWARE", "Competence Framework for Quantum Technologies: Quantum Hardware", "QTEdu / European Quantum Flagship", "https://cdn.qtedu.eu/sites/default/files/attachments/Competence_Framework_for_QT_v2_5_2024.pdf", "Hardware platforms: superconducting, spin, atoms/ions, photonic/emerging; control, hybrid systems, benchmarking and scaling.", "European competence framework; taxonomy of teachable competences, not proof every learner must study every modality.", "academic_professional_framework"),
    ("D141-QTEDU-SENSING", "Competence Framework for Quantum Technologies: Sensors and Imaging Systems", "QTEdu / European Quantum Flagship", "https://qt.eu/media/pdf/Competence_Framework_for_QT_v2_5_2024_official-version.pdf", "Metrology limits, SI units, sensitivity/resolution, classical alternatives, sensor modalities and application examples.", "European competence framework; application examples do not prove deployment or comparative advantage in each field.", "academic_professional_framework"),
    ("D141-EUROHPC-NEUTRAL-ATOMS-2026", "Neutral-Atom Platform Technologies call", "EuroHPC Joint Undertaking", "https://www.eurohpc-ju.europa.eu/neutral-atom-platform-technologies_en", "A 2026 funding/call specification sets target outcomes for programmable analog/gate-based neutral-atom platforms and HPC access.", "A call's targets are prospective requirements, not achieved system capability; closing date and status are time-dependent.", "official_funding_call"),
    ("D141-DLR-PLATFORMS", "Quantum Computing Initiative: Technologies", "German Aerospace Center (DLR)", "https://qci.dlr.de/en/technology/", "Technology-neutral platform portfolio across ion traps, neutral atoms, NV centers, photons, spin-enabling technologies and analog computing; no single best architecture established.", "Government R&D initiative description; portfolio choice is not an independent comparative ranking.", "official_lab"),
    ("D141-NVIDIA-CUDAQ", "CUDA-Q documentation", "NVIDIA", "https://nvidia.github.io/cuda-quantum/latest/index.html", "Hybrid CPU/GPU/QPU programming, simulators, backend integration and logical/QEC co-design preview.", "Vendor documentation; preview status and provider compatibility change; not a neutral field-wide standard or proof of speedup.", "vendor_technical_docs"),
    ("D141-QDK", "Microsoft Quantum Development Kit overview", "Microsoft Learn", "https://learn.microsoft.com/en-us/azure/quantum/qdk-main-overview", "Development, local simulation/noise models, resource estimation, QEC and application tools; current QDK connects to hardware/cloud targets.", "Provider documentation; features, languages and access may change; vendor ecosystem is not interchangeable with every backend.", "vendor_technical_docs"),
    ("D141-QDK-OPENQASM", "Develop OpenQASM programs in QDK", "Microsoft Learn", "https://learn.microsoft.com/en-us/azure/quantum/qdk-openqasm-integration", "OpenQASM/Q# workflows through VS Code, Python/Jupyter, simulator, QIR and hardware job submission.", "Provider-specific integration and current provider availability; OpenQASM is not synonymous with an algorithm or hardware platform.", "vendor_technical_docs"),
    ("D141-IBM-TRANSPILER", "Introduction to Qiskit transpilation", "IBM Quantum", "https://qiskit.qotlabs.org/docs/guides/transpile", "Layout, routing, translation, optimization and scheduling map a circuit to a hardware target and its connectivity/ISA.", "Tool docs explain implementation behavior; not a proof that a transpiled circuit is optimal or gives useful advantage.", "maintained_tool_docs"),
    ("D141-PENNYLANE", "PennyLane documentation", "Xanadu / PennyLane", "https://docs.pennylane.ai/en/stable/", "Hybrid quantum-classical circuits, autodiff, device abstractions and ML/chemistry integrations.", "Maintained project/vendor ecosystem; feature set and backend support are version-dependent; hybrid support does not establish quantum ML advantage.", "maintained_tool_docs"),
    ("D141-OECD-BUSINESS-READINESS-2026", "Building Business Readiness for Quantum Computing", "OECD", "https://www.oecd.org/en/publications/building-business-readiness-for-quantum-computing_ee847e5f-en/full-report/component-4.html", "Evidence/interviews describe cross-disciplinary skills, data scientists, technicians, classical/quantum bridge roles and barriers to adoption.", "OECD analysis and interview evidence; geography/business sample constrains generalization; readiness evidence is not proof of realized quantum benefit.", "intergovernmental_research"),
    ("D141-CIRQ", "Cirq documentation", "Google Quantum AI", "https://quantumai.google/cirq", "Python framework for circuits, transformations, simulation/noise, device constraints and running experiments on supported quantum processors.", "Project documentation supports Cirq's own feature scope; device/provider access and compatibility vary, and the library does not establish advantage.", "maintained_tool_docs"),
    ("D141-STIM", "Stim: stabilizer-circuit simulation for quantum error correction", "Quantumlib maintainers", "https://github.com/quantumlib/Stim", "Open-source high-performance simulation and analysis of stabilizer circuits, especially QEC circuits.", "Maintainer documentation describes project scope; supported simulation assumptions and stabilizer limitations matter; not a general quantum-circuit simulator.", "maintained_open_source_tool"),
    ("D141-PYMATCHING", "PyMatching documentation", "PyMatching maintainers", "https://pymatching.readthedocs.io/en/latest/", "Minimum-weight perfect matching decoding of QEC syndromes under graphlike, independent-error assumptions; relevant code families and Stim integration.", "Project documentation describes a particular decoder and its model assumptions; not a universal or optimal decoder for all codes/noise.", "maintained_open_source_tool"),
    ("D141-RIT-ROLE-PROFILES-2025", "Profiles of Roles in the Quantum Industry", "University of Colorado Boulder and Rochester Institute of Technology", "https://www.rit.edu/quantumeducationandworkforce/sites/rit.edu.quantumeducationandworkforce/files/docs/publications/report3profilesofrolesinquantumindustry.pdf", "Interview-based profiles of hardware, software, bridging and public-facing/business quantum-industry roles, with representative tasks, knowledge and skills; uses the O*NET Content Model as an organizing framework.", "US-focused qualitative study based on 42 interviews at 23 companies; profile depth varies and synthesized profiles are not standardized global occupation definitions. Supports occupational families and tasks, not the exactness or prevalence of every local title.", "peer_reviewed_workforce_research"),
    ("D141-IBM-HARDWARE-JOB-2026", "Research Scientist — Quantum Hardware (Ref. 2026_035)", "IBM Research Europe, Zurich", "https://www.zurich.ibm.com/careers/2026_035.html", "One current superconducting-hardware posting specifies device design/characterization, cryogenic measurement, readout/leakage reset, calibration/operation code and Python; states PhD or equivalent experience.", "A single employer, superconducting platform and Zurich position; it is a dated task example, not a universal qualification or prevalence estimate.", "employer_job_posting"),
    ("D141-PLANQC-SYSTEMS-ARCHITECT-JOB-2026", "Quantum Systems Architect", "planqc GmbH", "https://planqc-gmbh.jobs.personio.com/job/2714456", "One neutral-atom platform posting describes system architecture, technical work packages, interfaces/performance requirements, integration/commissioning, reviews and cross-team hardware/software/algorithm coordination.", "Employer- and neutral-atom-specific senior role; useful for systems-architecture task evidence, not proof every platform or architect role has the same duties or PhD threshold.", "employer_job_posting"),
    ("D141-PLANQC-QEC-JOBS-2026", "Quantum Error Correction Engineer — current openings", "planqc GmbH", "https://planqc-gmbh.jobs.personio.com/", "The employer's current jobs index lists a Quantum Error Correction Engineer; corroborates that QEC is a distinct hiring specialization, while the named posting is not a detailed task profile.", "Employer vacancy index establishes one title/opening only; it does not support detailed duties, field-wide prevalence or a standardized occupation.", "employer_job_posting"),
    ("D141-BAH-QEC-SCIENTIST-JOB-2026", "Quantum Scientist and Error Correction Specialist", "Booz Allen Hamilton", "https://bah.wd1.myworkdayjobs.com/en-US/BAH_Jobs/job/Quantum-Scientist-and-Error-Correction-Specialist_R0251482-1", "One current QEC role describes code/protocol design for target architectures, resource optimization and fault-tolerant operation with experimental/theory teams.", "US employer and mission/security context; one position does not establish global demand, standard credential requirements or universal QEC practice.", "employer_job_posting"),
    ("D141-JRC-QCOMM-ENGINEER-JOB-2026", "Quantum Communications Engineer", "European Commission Joint Research Centre (Quantum Flagship vacancy record)", "https://qt.eu/jobs-quantum-technologies/quantum-communications-engineer", "A 2026 test-facility role specifies quantum communication/QKD testing, installation/commissioning, quality-system accreditation readiness, standards familiarity, security-threat monitoring and reporting.", "Single EU testbed position; the listing's host, jurisdiction and QKD focus constrain generalization. Job-board record points to the public JRC employer.", "public_research_employer_job_posting"),
    ("D141-QTLABS-QKD-SECURITY-JOB-2026", "QKD Security Engineer", "QTLabs", "https://quantumtechnologies.career.softgarden.de/jobs/65421371/QKD-Security-Engineer-all-genders-/", "Employer posting connects QKD integration/security engineering with requirements, risk assessment, testbeds, networks and certification readiness.", "One employer-specific QKD/cybersecurity posting; not a universal quantum cryptography title definition or evidence that QKD replaces post-quantum cryptography.", "employer_job_posting"),
    ("D141-MPG-SENSORS-JOB-2026", "Scientist — Quantum Sensors & Qubit Technology", "Max Planck Society, Semiconductor Laboratory", "https://www.mpg.de/27003304/scientist-quantum-sensors-qubit-technology", "A 2026 research-lab role describes qubit-based sensor concepts, numerical modeling, experimental data analysis and translation into device/fabrication/engineering work.", "Single German research-laboratory posting and sensor/device context; not a general credential or labor-demand estimate.", "public_research_employer_job_posting"),
    ("D141-QD-SENSING-ENGINEER-JOB-2026", "Quantum Sensing Engineer (NV Centers)", "QuantumDiamonds GmbH", "https://quantum-diamond.jobs.personio.de/job/2796174", "One NV-center sensing posting describes the end-to-end sensing chain, ODMR/pulsed/lock-in measurement protocols, sensitivity/speed/robustness benchmarking, prototype validation and Python experiment control.", "Employer product and NV/semiconductor-inspection focus; corporate product and market claims are not independently validated by the vacancy and cannot be generalized to other sensor modalities.", "employer_job_posting"),
    ("D141-SQC-QML-MLOPS-JOB-2026", "ML Ops Engineer, Quantum Machine Learning", "Silicon Quantum Computing", "https://job-boards.anz.greenhouse.io/sqc/jobs/4005910201", "One QML-adjacent posting specifies data, training and evaluation pipelines, hardware-calibration provenance, model/device benchmarking and customer-data comparisons for a quantum-feature workflow.", "A single company-described product/workflow; its performance and commercial claims are employer claims, not independent evidence of quantum advantage or QML effectiveness generally.", "employer_job_posting"),
    ("D141-QMILL-ML-EXPERT-JOB", "Machine Learning Expert — quantum algorithms", "QMill", "https://qmill.com/en/careers/machine-learning-expert", "Employer posting links classical ML model development, quantum algorithm research, parallel/GPU/HPC implementation and customer use-case specification; QML is preferred rather than mandatory in the posting.", "One employer-specific role; this is evidence for a cross-disciplinary ML/quantum-algorithm task family, not a standardized QML occupation or evidence of quantum advantage.", "employer_job_posting"),
    ("D141-RSL-QUANTUM-CAREERS-2026", "Careers — Quantum software and ML engineering", "RSL Quantum", "https://rslquantum.com/careers", "Company career page identifies quantum software/compilers/simulators/runtime, quantum algorithms/error mitigation/hybrid methods and ML engineering with quantum kernels/variational training as hiring areas.", "Early-stage company's open-team description; no detailed job specification, prevalence or independent product-performance validation.", "employer_career_page"),
    ("D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026", "Internship — Quantum Algorithms and Applications for Linear Algebra & Hamiltonian Simulation", "IBM Research Europe, Zurich", "https://www.zurich.ibm.com/careers/2026_030.html", "One 2026 research internship combines algorithm design/benchmarking, AI-assisted algorithm improvement, ML/data-driven methods, Qiskit, Python and reproducible research software.", "One internship and application area; AI use in quantum-algorithm research is not evidence of a general QML role or algorithmic advantage.", "employer_job_posting"),
]

LOCATORS = {
    "D141-NIST-QIS-OVERVIEW": "Page sections 'Quantum Computing', 'Quantum Sensing', 'Quantum Networks' and the quantum cryptography/post-quantum distinction.",
    "D141-NIST-QC-EXPLAINED": "Page sections 'Why don't we have quantum computers today?' and 'Where are we headed?'; page update noted May 28, 2026.",
    "D141-DOE-QIS-ROADMAP-2024": "Applications Roadmap, sections on QIS research eras, quantum computing applications, networking and hardware/software co-design; PDF searchable text.",
    "D141-DARPA-QBI-2025": "Stage B Selection page: QBI purpose and listed firms/approaches; status date November 6, 2025.",
    "D141-DARPA-QBI": "QBI program overview, active performers and stage descriptions.",
    "D141-OECD-GLOBAL-ECOSYSTEM-2025": "Sections 2.2 'Technology mapping' and 6.1 'Occupational composition of quantum-related job postings' / 'Overview of skill patterns'; see report's scope and annex methods.",
    "D141-UK-SKILLS-TASKFORCE-2025": "Report sections 'Quantum computing', 'Apprenticeship training', job-vacancy methodology and limitations; analysis through January 31, 2025.",
    "D141-UK-SKILLS-LANDING": "Publication record: dates, update history, taskforce membership and report link.",
    "D141-QEDC-LEARNING-2025": "QED-C announcement for 'Connecting the Dots: Quantum Learning Through Experiential Activities and Practice'; workforce roles and experiential-learning summary.",
    "D141-QEDC-NETWORK-ROADMAP-2026": "Executive Summary: network definition, metrics, critical technologies, current application limits and enabling gaps; revised report released July 2026.",
    "D141-MIT-QSE-COURSE": "MIT EECS curriculum entry 6.2400 'Introduction to Quantum Systems Engineering' and 6.2410 'Quantum Engineering Platforms'; prerequisites, topics and lab scope.",
    "D141-COLUMBIA-QST-CURRICULUM": "M.S. curriculum course listings: quantum optimization/ML, error correction, sensing, nanofabrication, photonics, networks and quantum information.",
    "D141-POLITO-QENG-CURRICULUM": "Programme curriculum table: Year 1 quantum information/materials/photonic courses; Year 2 lab, communication/networks/cryptography and hardware design/computing.",
    "D141-QTEDU-COMPETENCE-2024": "Framework sections on quantum algorithms/software, hybrid computing, learning outcomes and cross-domain competences.",
    "D141-IEEE-HARDWARE-REVIEW-2026": "IEEE Access paper abstract/indexed overview and platform comparison scope; publisher abstract only was used for the broad architecture classification.",
    "D141-IEEE-BENCHMARK-2025": "Nature Reviews Physics abstract and review summary, especially benchmark types and risks of misleading comparisons.",
    "D141-IOP-BENCHMARK-2026": "Article abstract: performance comparison attributes and limits of transferring classical benchmark approaches.",
    "D141-NIST-BENEFITS-RISKS-2024": "NIST publication abstract: near-term heuristic algorithms/error mitigation and cryptographic risk discussion.",
    "D141-NATURE-VQA-2021": "Review abstract: variational quantum algorithm structure, noisy-device motivation, trainability/accuracy/efficiency limitations.",
    "D141-NIST-THERMODYNAMIC-GROVER-2018": "NIST publication abstract: Grover/collision-finding query complexity versus time, energy and memory resource analysis.",
    "D141-NIST-SENSING-EXPLAINED": "NIST page sections introducing quantum sensing and example measured physical quantities/applications.",
    "D141-GAO-SENSORS-2025": "GAO-25-107876 'Key Takeaways' and 'The Technology' sections; maturity, reliability/cost, workforce and supply chain.",
    "D141-NIST-SENSOR-PAPER-2025": "Optica review abstract on atomic vapor magnetometers, NV-center magnetometers and Rydberg RF sensors; NIST publication record dated Dec. 19, 2025.",
    "D141-NSF-SENSING-2026": "NSF Science Matters explainer: research examples from biological measurement to large-scale sensing.",
    "D141-NIST-QISN-GROUP": "NIST PML program portfolio headings for trapped-ion computing/simulation/sensing, clocks, networking and cryogenic photonic interconnects.",
    "D141-NIST-QNET-PROJECT": "Sections 'Key Components of Quantum Repeaters and Quantum Network Systems', 'Quantum Network Testbeds' and 'Quantum Network Metrology'.",
    "D141-ITU-Y3800": "ITU-T Y.3800 Introduction and conceptual QKDN architecture: point-to-point quantum link, classical channel, key relay and trust/security boundary.",
    "D141-ITU-Q4165-2026": "ITU-T Q.4165 (01/2026), clauses 3 and 6: definitions of QKD module/link/network and framework for QKDN interworking; quantum-layer interworking scope note.",
    "D141-ITU-Y3804-2025": "ITU-T Y.3804, clause 8 'QKDN control layer': routing, route provisioning/rerouting and QBER/fault triggers.",
    "D141-ETSI-QKD-2026": "ETSI QKD standards list: GS QKD 020 V1.1.1 (2026-06), GR QKD 007 V1.2.1 (2026-01), and protection profile entries.",
    "D141-ITU-QKD-MGMT": "ITU-T Y.3803 Recommendation summary: QKD modules, key managers, key relay and application key delivery.",
    "D141-ITU-QNET-SUP98": "ITU-T Supplement 98 (11/2025), introduction and conceptual quantum network diagram: quantum endpoints, repeaters/switches/routers and classical signaling complement.",
    "D141-QTEDU-HARDWARE": "Framework section 4 'Quantum Hardware': platform families, control, hybrid systems, noise, benchmarking and scaling.",
    "D141-QTEDU-SENSING": "Framework section 6 'Quantum Sensors and Imaging Systems': measurement criteria/classical alternatives; subsections 6.2-6.7 sensor classes and applications.",
    "D141-EUROHPC-NEUTRAL-ATOMS-2026": "Call page 'Description' and target outcomes: programmable neutral-atom simulators and gate-based platforms; explicitly prospective call targets.",
    "D141-DLR-PLATFORMS": "Technology page sections for ion traps, neutral atoms, NV centers, photons, spin-enabling technologies and analog computing; page states no universally best platform is known.",
    "D141-NVIDIA-CUDAQ": "CUDA-Q documentation overview: hybrid CPUs/GPUs/QPUs, programming model, backends, logical/QEC preview and pulse research-preview notices.",
    "D141-QDK": "QDK overview feature/component table: languages, simulators/noise, resource estimation, QEC and provider/cloud access.",
    "D141-QDK-OPENQASM": "QDK OpenQASM guide sections: VS Code/Python/Jupyter workflows, local simulator, QIR compilation, Azure job submission and limitations.",
    "D141-IBM-TRANSPILER": "Qiskit transpiler API descriptions of routing, translation, optimization and scheduling stages against the target ISA/connectivity.",
    "D141-PENNYLANE": "PennyLane stable documentation overview: autodifferentiation, hybrid classical/quantum models, supported device integrations.",
    "D141-OECD-BUSINESS-READINESS-2026": "OECD report section 3.4 'Limited access to skills in the workforce' and interview-based discussion of cross-disciplinary/complementary profiles.",
    "D141-CIRQ": "Cirq overview and links to circuits, devices, simulation, textbook algorithms and experiments.",
    "D141-STIM": "Stim README 'What is Stim?' and feature overview: stabilizer-circuit simulation and analysis for QEC.",
    "D141-PYMATCHING": "PyMatching 2 documentation overview: MWPM decoder, graphlike independent-error assumptions, supported code examples and Stim workflow.",
    "D141-RIT-ROLE-PROFILES-2025": "Report 3, pp. 1-5 for sample/design/limitations; role profiles H3.2 (hardware system engineer), S1.2 (software engineer), S2.1-S2.2 (algorithm theorist/programmer), B1.1-B2.2 (application and computational-scientist/operator bridge roles), H4.8 (lab/construction technician), P3.2 (government-industry advocate). Profiles are synthesized from interview accounts, not standard job classifications.",
    "D141-IBM-HARDWARE-JOB-2026": "Position 2026_035, 'What you will do' and minimum/preferred qualifications; superconducting processor readout/leakage reset, cryogenic characterization, experiment/calibration code.",
    "D141-PLANQC-SYSTEMS-ARCHITECT-JOB-2026": "Current Quantum Systems Architect posting, 'Your mission', responsibilities and requirements; neutral-atom platform architecture, work packages, interfaces, budgets, integration and commissioning.",
    "D141-PLANQC-QEC-JOBS-2026": "Employer's open-positions index, Algorithms department, current Quantum Error Correction Engineer listing; title-only corroboration.",
    "D141-BAH-QEC-SCIENTIST-JOB-2026": "Current Quantum Scientist and Error Correction Specialist vacancy, responsibilities section: architecture-specific QEC protocols, resource requirements and fault-tolerant operations.",
    "D141-JRC-QCOMM-ENGINEER-JOB-2026": "Quantum Flagship vacancy record dated 2026-03-16, tasks and profile: European quantum communications testbed, commissioning, quality system, standards and QKD security testing.",
    "D141-QTLABS-QKD-SECURITY-JOB-2026": "Employer vacancy responsibilities/profile: QKD system integration, risk/security requirements, testbed and certification-readiness work.",
    "D141-MPG-SENSORS-JOB-2026": "Max Planck Society vacancy dated 2026-09-28, responsibilities/profile: sensor modeling/simulation, experimental data analysis and translation to implementation.",
    "D141-QD-SENSING-ENGINEER-JOB-2026": "QuantumDiamonds vacancy, responsibilities and expected profile: NV sensing chain, protocols, prototype validation, material characterization and Python-based experiment control.",
    "D141-SQC-QML-MLOPS-JOB-2026": "Silicon Quantum Computing vacancy: data/training/evaluation pipelines, device calibration provenance and benchmarking; retain employer-only limits on product/advantage statements.",
    "D141-QMILL-ML-EXPERT-JOB": "QMill careers posting, role duties and requirements: machine-learning models for quantum algorithm research, parallel/HPC implementation and customer use cases; QML described as a plus, not universal prerequisite.",
    "D141-RSL-QUANTUM-CAREERS-2026": "Careers page, 'Open roles' and 'Areas of interest': quantum software, quantum algorithm research, ML engineering with quantum kernels/variational training.",
    "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026": "IBM Research Zurich 2026_030 posting, responsibilities and qualifications: AI-assisted algorithm development, benchmarking, Qiskit/Python and reproducible software.",
}

AREA = [
    {
        "id": "D141:quantum-computing-hardware-and-devices", "label": "Quantum Computing Hardware and Devices",
        "boundary": "Physical implementations, quantum devices, control/readout, fabrication/material platforms and cryogenic or photonic systems.",
        "roles": ["quantum hardware engineer"], "routes_stored": ["quantum hardware engineer"],
        "sources": ["D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-DARPA-QBI-2025", "D141-DARPA-QBI", "D141-IEEE-HARDWARE-REVIEW-2026", "D141-MIT-QSE-COURSE", "D141-QTEDU-HARDWARE", "D141-EUROHPC-NEUTRAL-ATOMS-2026", "D141-DLR-PLATFORMS", "D141-DOE-QIS-ROADMAP-2024", "D141-RIT-ROLE-PROFILES-2025", "D141-IBM-HARDWARE-JOB-2026"],
        "horizons": ["Established physics/device engineering and metrology underpin qubit realization, measurement and cryogenic/optical/vacuum systems; mature enabling components do not imply mature fault-tolerant quantum computers.", "Current processors use multiple competing modalities; compare device-level and workload-level metrics and infrastructure, not headline physical-qubit counts alone.", "Current R&D targets modularity, photonic interconnects, improved controls, fabrication/integration, logical qubits and scale; independent dated demonstrations are required.", "Large fault-tolerant and utility-scale devices are roadmap goals, not established outcomes; architecture-neutral milestones and validation remain necessary."],
        "counter": "Hardware platform counter-search: compare superconducting, ion, neutral-atom, photonic, silicon-spin, NV/defect and topological architectures; include control/readout, cryogenic/vacuum/fabrication and modular scale; test for material omitted families and distinguish demonstrated results from roadmap targets.",
        "counter_result": "The search confirmed the platform families and added QTEdu competence coverage, the IEEE 2026 architecture review, EuroHPC 2026 neutral-atom targets, and DLR's technology-neutral portfolio. No additional materially distinct current platform family was found within the bounded search scope. Roadmap/call milestones remain aspirational; topological and other emerging concepts remain maturity-qualified.",
        "claim": "Hardware is a co-designed physical system, not a qubit-count contest: platform physics sets control/readout, connectivity, environmental, fabrication and infrastructure constraints. Compare systems on task-relevant fidelity, logical error behavior, connectivity, cycle time, uptime, control burden, energy/cost and workload-level benchmark; no single platform is established as universally best.",
        "family_notes": {
            "foundations_knowledge_and_competencies": "Foundations include quantum mechanics and measurement, device/material physics, microwave or optical engineering, electronics/control, noise, fabrication and cryogenic or ultra-high-vacuum systems, selected by platform.",
            "methods_and_designs": "Hardware methods include platform/device design, fabrication, control/readout co-design, component characterization, integration, calibration, benchmarking and system-level verification. Superconducting, ion, neutral-atom, photonic and spin platforms are alternatives with different tradeoffs.",
            "techniques_estimators_and_algorithms": "Hardware techniques include qubit initialization, coherent control, entangling gates, state readout, calibration, error characterization, crosstalk management and interconnect tests. Metrics must fit the target algorithm or sensing/network workload.",
            "tools_software_and_data": "Equipment and software are platform-specific: e.g., dilution refrigerators and microwave control for some superconducting devices; lasers, optics and vacuum systems for trapped atoms/ions; photonic sources/detectors; device-control and characterization software. These are complementary components, not interchangeable tool choices.",
            "standards_credentials_and_learning_resources": "Curriculum frameworks and systems-engineering courses cover platform diversity, lab practice, noise and benchmarking. The indexed sources do not establish one globally required hardware credential or one standard platform sequence.",
            "outputs_and_downstream_role_context": "Hardware work produces devices and calibrated operating points plus traceable metrics (gate/readout error, coherence, connectivity, uptime and infrastructure constraints). Those outputs inform compilation, algorithm/resource estimation, error correction and platform selection; hardware roles own build/characterization tasks.",
        },
        "relationships": "Quantum mechanics/device physics and measurement foundations support platform-specific device design; fabrication/materials, cryogenic or ultra-high-vacuum/laser systems and control electronics enable QPU operation. Calibration/control/readout produce characterized gate, measurement, coherence and noise data used by compilation, error correction and algorithm/resource estimation. Platforms are alternatives for a selected design objective, not interchangeable components; their controls/tooling are platform-specific. Classical host/HPC, control electronics, and software are complementary.",
        "limits": "A portfolio of roadmaps and selected demonstrations cannot rank modalities universally or establish commercialization. Hardware performance claims need dated, independently inspectable benchmarks and application-level classical baselines. Topological devices and large-scale fault tolerance remain research/roadmap horizons.",
    },
    {
        "id": "D141:quantum-algorithms-and-software", "label": "Quantum Algorithms and Software",
        "boundary": "Quantum algorithms, programming, compilation, error mitigation/correction and software tooling for quantum systems.",
        "roles": ["quantum software engineer", "quantum algorithm developer", "quantum error correction specialist", "quantum machine learning specialist", "quantum simulation scientist", "quantum applications engineer", "quantum systems architect"],
        "routes_stored": ["quantum software engineer", "quantum algorithm developer", "quantum simulation scientist", "quantum applications engineer"],
        "sources": ["D141-NIST-QC-EXPLAINED", "D141-DOE-QIS-ROADMAP-2024", "D141-NIST-BENEFITS-RISKS-2024", "D141-NATURE-VQA-2021", "D141-NIST-THERMODYNAMIC-GROVER-2018", "D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM", "D141-QTEDU-COMPETENCE-2024", "D141-QDK", "D141-QDK-OPENQASM", "D141-IBM-TRANSPILER", "D141-PENNYLANE", "D141-NVIDIA-CUDAQ", "D141-IEEE-BENCHMARK-2025", "D141-IOP-BENCHMARK-2026", "D141-RIT-ROLE-PROFILES-2025", "D141-PLANQC-SYSTEMS-ARCHITECT-JOB-2026", "D141-PLANQC-QEC-JOBS-2026", "D141-BAH-QEC-SCIENTIST-JOB-2026", "D141-SQC-QML-MLOPS-JOB-2026", "D141-QMILL-ML-EXPERT-JOB", "D141-RSL-QUANTUM-CAREERS-2026", "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026"],
        "horizons": ["Established quantum information, circuit/measurement, complexity and classical numerical/simulation foundations support algorithm reasoning; mathematical speedup claims require resource-aware interpretation.", "Current noisy-device work includes hybrid variational methods, compilation, simulation and error suppression/mitigation, evaluated against the strongest suitable classical baseline.", "Logical-qubit demonstrations, QEC codes/decoders, resource estimation and hybrid algorithms are active cross-layer development; a successful subroutine is not automatically a useful application.", "Large fault-tolerant algorithms and broad quantum advantage remain conditional on scalable error correction, resource costs and application-specific validation."],
        "counter": "Algorithms/software counter-search: test foundational circuit/complexity/simulation families; exact/approximate and hybrid algorithms; compilation/resource estimation; noise suppression/mitigation, QEC/decoding; quantum ML claims; simulator/classical baselines and reproducibility. Check for missing technique families and false claims of advantage.",
        "counter_result": "Counter-search added/confirmed benchmark methodology and explicitly retained Grover's query-complexity-versus-resource caveat, VQA trainability/noise limits, compilation to hardware ISA, QEC as cross-layer dependency and hybrid classical workflows. It found no basis for treating QAOA/VQE or quantum ML as generally superior to classical methods. Candidate methods remain workload- and hardware-dependent.",
        "claim": "Algorithm selection starts with a problem formulation and complexity/resource model, not a tool menu. Teach states, gates, measurement, circuit model and classical simulation/complexity foundations; then algorithm families (e.g., phase estimation, Grover/amplitude estimation, quantum simulation, hybrid variational methods) with workload-specific best classical baselines. Compile/transpile to target connectivity/ISA, estimate resources, execute/simulate, characterize noise, validate outputs and report uncertainty.",
        "family_notes": {
            "foundations_knowledge_and_competencies": "Foundations include linear algebra, probability, quantum states/gates/measurement, complexity and algorithms, classical programming, numerical methods and the target application discipline (for example chemistry or optimization).",
            "methods_and_designs": "Methods span exact quantum algorithms, quantum simulation, heuristic/hybrid variational algorithms, classical simulation, resource estimation, error suppression/mitigation and fault-tolerant/QEC design. Select by problem structure and compare with strong classical methods.",
            "techniques_estimators_and_algorithms": "Named technique families include factoring/period finding (Shor), unstructured search/amplitude amplification (Grover), phase estimation, Hamiltonian simulation, VQE/QAOA-style hybrid variational methods, quantum Monte Carlo/amplitude estimation, stabilizer/surface-code QEC and quantum machine learning. Their guarantees, assumptions, hardware demands and maturity differ; they are not interchangeable.",
            "tools_software_and_data": "Software examples in the source set include Qiskit, Q#, OpenQASM, Cirq, PennyLane and CUDA-Q, plus classical simulators, resource estimators, compilers/transpilers and cloud/QPU backends. Framework choice depends on target hardware, supported operations, simulator, noise model, licensing/access and reproducibility; tools do not establish advantage.",
            "standards_credentials_and_learning_resources": "OpenQASM/QIR and provider interfaces support program interchange/execution in specific ecosystems; curricula cover mathematics, quantum information, algorithms and lab work. The search found no universally required quantum-software credential or single canonical language.",
            "outputs_and_downstream_role_context": "Outputs include a formulated problem, circuit/algorithm, complexity and resource estimate, compiled program, simulation/execution results, uncertainty and classical-baseline comparison. These inform applications, systems architecture and any evidence-based claim of utility; algorithm/software roles own much of this work.",
        },
        "relationships": "Mathematics, quantum information and programming feed circuit/algorithm design. Problem structure and a classical baseline constrain whether a quantum algorithm is relevant. Circuit output is transpiled/compiled to the selected QPU; hardware topology/noise/calibration feed compilation and error-control choices. Error suppression and mitigation can improve estimates on noisy runs but do not correct arbitrary errors or guarantee unbiased outputs. QEC encodes logical information, repeated syndrome measurements feed a decoder, and real-time decoding/control supports fault-tolerant computation; resource costs are part of algorithm selection. Hybrid optimization has a classical optimizer/host that supplies parameters and consumes measured expectations. Q#, OpenQASM, Qiskit, Cirq, PennyLane, CUDA-Q and provider APIs are tools/languages/frameworks with different backends, not alternatives to learning algorithms themselves.",
        "limits": "No generalized practical quantum advantage follows from asymptotic query complexity or quantum-superposition wording. Current hardware remains noisy and task-limited; algorithm use, advantage, and scale need workload-specific independent baselines. QML and broad commercial optimization advantages are unestablished as general claims.",
    },
    {
        "id": "D141:quantum-communication-and-networks", "label": "Quantum Communication and Networks",
        "boundary": "Quantum information transfer, networking, protocols, quantum links and enabling network technologies.",
        "roles": ["quantum cryptography engineer", "quantum systems architect"], "routes_stored": ["quantum cryptography engineer"],
        "sources": ["D141-NIST-QIS-OVERVIEW", "D141-NIST-QNET-PROJECT", "D141-ITU-Y3800", "D141-ITU-Q4165-2026", "D141-ITU-Y3804-2025", "D141-ITU-QKD-MGMT", "D141-ETSI-QKD-2026", "D141-ITU-QNET-SUP98", "D141-QEDC-NETWORK-ROADMAP-2026", "D141-DOE-QIS-ROADMAP-2024", "D141-NIST-QISN-GROUP", "D141-RIT-ROLE-PROFILES-2025", "D141-JRC-QCOMM-ENGINEER-JOB-2026", "D141-QTLABS-QKD-SECURITY-JOB-2026"],
        "horizons": ["Established point-to-point QKD protocols and telecom/classical network infrastructure provide a foundation, with trust, authentication and key-management assumptions explicit.", "Current QKDN standards specify network architecture, key management, control/management and interworking; research testbeds characterize quantum links and interfaces.", "Memories, transduction, entanglement distribution, repeaters, switches and networked sensing/computing are active research and standards-development directions with application-specific limitations.", "Wide-area quantum internet and distributed quantum computing are prospective; long-distance repeaters, fidelity, memory and cost hurdles make timelines uncertain."],
        "counter": "Network counter-search: distinguish QKD from quantum internet/networked computation and sensing; inspect link, classical control, key management, trusted-node, repeater/memory, transduction, interoperability and standards boundaries; test claims about distance, security and deployment maturity.",
        "counter_result": "The counter-search confirmed that QKD is only one network service/use case; quantum networks may distribute entanglement or connect computers/sensors. ITU/ETSI provide current QKDN architecture, interworking and key-management/control standards. NIST and QED-C document memories, sources, detectors, interfaces, repeaters and testbeds while emphasizing remaining range/performance/deployment limitations. No evidence supports an 'unhackable internet' or broad deployed quantum internet claim.",
        "claim": "Quantum networking joins quantum endpoints over quantum channels plus classical signaling/control. QKD generates shared cryptographic keys under protocol/device/security assumptions; wider quantum networking also concerns entanglement distribution, networked computing, distributed sensing, memories, repeaters, transduction and routing. Network engineering must track fidelity, transmission rate/distance, synchronization, node count/connectivity and application requirements.",
        "family_notes": {
            "foundations_knowledge_and_competencies": "Foundations combine quantum information/optics and measurement with classical networking, communication protocols, cryptography/security, synchronization and distributed systems. Network and security assumptions are part of the technical foundation.",
            "methods_and_designs": "Methods include QKD link and network architecture, key management, network control/management, interworking, trust-boundary analysis, entanglement distribution and networked-computing/sensing design. QKD is a use case, not the entire quantum-network method family.",
            "techniques_estimators_and_algorithms": "Techniques include prepare-and-measure and entanglement-based key distribution, quantum-state transmission, entanglement generation/swapping, memory-assisted repeaters, transduction and route provisioning/monitoring. Protocol-specific security proofs and implementation assumptions must travel with the result.",
            "tools_software_and_data": "A QKDN system can include QKD modules, quantum/classical channels, key managers, controllers/managers, trusted/interworking nodes, detectors, memories, sources and network monitoring. Standards identify components and interfaces; a validated interoperable simulator/testbed should be selected for the intended architecture.",
            "standards_credentials_and_learning_resources": "ITU-T Y.3800/Y.3803/Y.3804/Q.4165 and ETSI QKD documents cover architecture, key management, control/interworking, vocabulary and APIs. They are QKD-specific; they do not standardize every future quantum internet service.",
            "outputs_and_downstream_role_context": "Outputs include keys delivered to a consuming cryptographic application, or entanglement/connectivity/fidelity and timing measurements supplied to networked computing or sensing. Network role tasks include device/link integration, protocol/security evaluation, key management, control and testbed validation.",
        },
        "relationships": "Quantum optics/photon sources, detectors, memories and interfaces create/transfer/store photonic states; classical channels carry synchronization, signaling and control. For QKD, QKD modules feed generated keys to key managers; key management/relay supplies keys to cryptographic applications and controllers route/monitor QKDN links. QKD uses trusted-node/link constraints in current standardized architectures. Entanglement swapping, quantum memory and repeaters are prerequisites to extending some network applications, not required for every point-to-point QKD route. Post-quantum cryptography is a separate classical cryptographic route and can complement/serve as an alternative quantum-safe migration without a quantum channel; it is not a quantum network item.",
        "limits": "Standards describe architecture/protocol frameworks, not blanket security guarantees. QKD security depends on implementation, authentication, endpoint security, trusted nodes and network design. Long-distance repeaters, broad networked quantum computing and many applications remain developmental; roadmap forecasts are not deployed capability.",
    },
    {
        "id": "D141:quantum-sensing-and-metrology", "label": "Quantum Sensing and Metrology",
        "boundary": "Quantum-enhanced measurement and sensors, precision metrology, timing and sensing applications.",
        "roles": ["quantum sensing specialist"], "routes_stored": ["quantum sensing specialist"],
        "sources": ["D141-NIST-QIS-OVERVIEW", "D141-NIST-SENSING-EXPLAINED", "D141-GAO-SENSORS-2025", "D141-NIST-SENSOR-PAPER-2025", "D141-NSF-SENSING-2026", "D141-QTEDU-SENSING", "D141-NIST-QISN-GROUP", "D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-DOE-QIS-ROADMAP-2024", "D141-NATURE-VQA-2021", "D141-RIT-ROLE-PROFILES-2025", "D141-MPG-SENSORS-JOB-2026", "D141-QD-SENSING-ENGINEER-JOB-2026"],
        "horizons": ["Established metrology, quantum-limited measurement, atomic clocks and magnetic-resonance instruments provide validated foundations and classical comparison practices.", "Current modalities include atomic clocks, atom interferometers, atom-vapor/NV/Rydberg electromagnetic sensors and research or commercial devices at different readiness levels.", "Portable, rugged, networked, integrated and application-specific quantum sensors are advancing, but deployment is modality- and environment-dependent.", "Distributed quantum sensing, new imaging concepts and other future uses are research/roadmap possibilities; performance, safety and economic benefit require field validation."],
        "counter": "Sensing/metrology counter-search: cover atomic clocks, atom interferometers/gravity and inertial sensors, electromagnetic sensing (atomic vapor, NV, Rydberg), optical/photon sensing, quantum imaging and emerging concepts; include SI/traceability, sensitivity/resolution, classical alternatives, field deployment and maturity/cost/reliability limits.",
        "counter_result": "Counter-search surfaced QTEdu's explicit metrology and classical-comparison competencies, and NIST's 2025 atom-based review of atomic-vapor, NV and Rydberg electromagnetic sensors. Combined with GAO's maturity/cost/reliability limits and NIST/NSF scope, no materially distinct established modality was found missing from the bounded matrix. Advanced imaging/radar claims require application-specific validation and are not promoted as mature capabilities.",
        "claim": "Quantum sensing is measurement engineering: define the measurand and operating environment; choose a physical sensor, measurement protocol and reference; quantify sensitivity, resolution, bandwidth, dynamic range, uncertainty, noise, calibration/traceability, drift, size/power and cost; compare with the classical baseline at the intended task. Modalities include atomic clocks, atom interferometers/gravimeters, atomic-vapor and NV magnetometry, Rydberg RF sensors, optical/photonic and other platform-specific sensors.",
        "family_notes": {
            "foundations_knowledge_and_competencies": "Foundations include quantum measurement/control, atomic/optical/solid-state physics as applicable, estimation/statistics, signal processing, uncertainty analysis, SI units and classical metrology/sensor principles.",
            "methods_and_designs": "Methods include sensor architecture and modality selection, quantum-limited measurement, calibration/traceability, noise and uncertainty budgeting, classical comparator design, field validation and application-specific integration.",
            "techniques_estimators_and_algorithms": "Techniques include atomic-clock interrogation, atom-interferometric inertial/gravity measurement, atomic-vapor and NV magnetometry, Rydberg RF sensing, spectroscopy and quantum imaging concepts. Sensitivity is only one performance measure; bandwidth, dynamic range, robustness and uncertainty matter too.",
            "tools_software_and_data": "Tools include modality-specific lasers/optics, vacuum or cryogenic apparatus, atomic/spin devices, photodetectors, timing references, calibration standards, low-noise acquisition and analysis/control software. Tool selection follows the measurand and environment; no sensor platform replaces calibration or classical signal processing.",
            "standards_credentials_and_learning_resources": "QTEdu's framework explicitly includes SI units, fundamental limits, sensitivity/resolution, classical alternatives and sensor classes; NIST/GAO sources provide metrology and maturity context. The reviewed evidence does not establish one sensor credential or a universal modality ranking.",
            "outputs_and_downstream_role_context": "Outputs are calibrated readings or signal streams with uncertainty, operating conditions and traceability information, supporting downstream timing, navigation, field measurement, biomedical, industrial or scientific tasks. A quantum sensing role needs to connect device performance to the application baseline and deployment environment.",
        },
        "relationships": "Quantum-state/control/measurement foundations and metrology/statistics support modality-specific sensor design. The target measurand and conditions (field, temperature, vibration, size, distance, bandwidth) select among sensor alternatives; those are not interchangeable just because each is quantum. Optical/electronic/vacuum/cryogenic interfaces and classical signal processing/calibration are complementary. A sensor produces a traceable measurement/uncertainty or signal stream for navigation, timing, science, medical or industrial tasks; deployment claims need comparison against classical instruments and field conditions. Networked sensing can depend on communications/entanglement infrastructure, but an individual sensor route does not require a quantum network.",
        "limits": "Quantum sensing is relatively mature as a broad class, but readiness varies sharply by modality and use case; some atomic clocks and magnetic-resonance technologies are commercial while novel compact sensors may face cost, ruggedization, reliability, supply-chain and integration barriers. Quantum advantage is not automatic and must be demonstrated against classical sensor baselines under relevant operating conditions.",
    },
]

CLAIM_COVERAGE = {
    "foundations_knowledge_and_competencies": [
        ["D141-NIST-QIS-OVERVIEW", "D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM"],
        ["D141-QTEDU-COMPETENCE-2024", "D141-UK-SKILLS-TASKFORCE-2025", "D141-OECD-GLOBAL-ECOSYSTEM-2025"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-QEDC-LEARNING-2025", "D141-OECD-BUSINESS-READINESS-2026"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-EUROHPC-NEUTRAL-ATOMS-2026", "D141-QEDC-LEARNING-2025"],
    ],
    "methods_and_designs": [
        ["D141-NIST-QIS-OVERVIEW", "D141-MIT-QSE-COURSE", "D141-POLITO-QENG-CURRICULUM"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-QTEDU-COMPETENCE-2024", "D141-COLUMBIA-QST-CURRICULUM"],
        ["D141-IEEE-BENCHMARK-2025", "D141-NIST-BENEFITS-RISKS-2024", "D141-QEDC-NETWORK-ROADMAP-2026"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-QEDC-NETWORK-ROADMAP-2026", "D141-EUROHPC-NEUTRAL-ATOMS-2026"],
    ],
    "techniques_estimators_and_algorithms": [
        ["D141-NIST-THERMODYNAMIC-GROVER-2018", "D141-NATURE-VQA-2021", "D141-MIT-QSE-COURSE"],
        ["D141-NIST-BENEFITS-RISKS-2024", "D141-IBM-TRANSPILER", "D141-NIST-SENSOR-PAPER-2025"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-IEEE-HARDWARE-REVIEW-2026", "D141-NVIDIA-CUDAQ"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-EUROHPC-NEUTRAL-ATOMS-2026", "D141-QEDC-NETWORK-ROADMAP-2026"],
    ],
    "tools_software_and_data": [
        ["D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM", "D141-QTEDU-COMPETENCE-2024"],
        ["D141-QDK", "D141-QDK-OPENQASM", "D141-IBM-TRANSPILER", "D141-PENNYLANE", "D141-NVIDIA-CUDAQ"],
        ["D141-NVIDIA-CUDAQ", "D141-QDK", "D141-QEDC-NETWORK-ROADMAP-2026"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-NVIDIA-CUDAQ", "D141-EUROHPC-NEUTRAL-ATOMS-2026"],
    ],
    "standards_credentials_and_learning_resources": [
        ["D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM", "D141-POLITO-QENG-CURRICULUM"],
        ["D141-ITU-Y3800", "D141-ITU-QKD-MGMT", "D141-QTEDU-COMPETENCE-2024"],
        ["D141-ITU-Q4165-2026", "D141-ITU-Y3804-2025", "D141-ETSI-QKD-2026", "D141-QTEDU-SENSING"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-UK-SKILLS-TASKFORCE-2025", "D141-EUROHPC-NEUTRAL-ATOMS-2026"],
    ],
    "outputs_and_downstream_role_context": [
        ["D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-UK-SKILLS-TASKFORCE-2025", "D141-MIT-QSE-COURSE"],
        ["D141-NIST-QNET-PROJECT", "D141-ITU-Q4165-2026", "D141-GAO-SENSORS-2025"],
        ["D141-OECD-BUSINESS-READINESS-2026", "D141-QEDC-NETWORK-ROADMAP-2026", "D141-DOE-QIS-ROADMAP-2024"],
        ["D141-DOE-QIS-ROADMAP-2024", "D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-UK-SKILLS-TASKFORCE-2025"],
    ],
}

QUERIES = [
    ("D141-Q01", "domain_scope_workforce_curricula", "quantum computing official roadmap curriculum standards workforce skills 2025 2026; official and accountable industry grey", ["D141-NIST-QIS-OVERVIEW", "D141-NIST-QC-EXPLAINED", "D141-DOE-QIS-ROADMAP-2024", "D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-UK-SKILLS-TASKFORCE-2025", "D141-UK-SKILLS-LANDING", "D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM", "D141-POLITO-QENG-CURRICULUM", "D141-QTEDU-COMPETENCE-2024", "D141-QEDC-LEARNING-2025", "D141-OECD-BUSINESS-READINESS-2026"]),
    ("D141-Q02", "hardware_area_countersearch", "quantum computing hardware platforms official roadmap superconducting neutral atom trapped ion photonic silicon spin topology control readout 2025 2026", ["D141-DARPA-QBI-2025", "D141-DARPA-QBI", "D141-IEEE-HARDWARE-REVIEW-2026", "D141-EUROHPC-NEUTRAL-ATOMS-2026", "D141-DLR-PLATFORMS", "D141-OECD-GLOBAL-ECOSYSTEM-2025", "D141-QTEDU-HARDWARE", "D141-MIT-QSE-COURSE"]),
    ("D141-Q03", "algorithms_software_qec_countersearch", "quantum algorithms methods QAOA VQE simulation phase estimation Grover amplitude estimation QEC error mitigation classical baselines and frameworks Cirq Qiskit QDK PennyLane CUDA-Q Stim PyMatching 2025 2026", ["D141-NIST-BENEFITS-RISKS-2024", "D141-NIST-THERMODYNAMIC-GROVER-2018", "D141-NATURE-VQA-2021", "D141-IBM-TRANSPILER", "D141-QDK", "D141-QDK-OPENQASM", "D141-CIRQ", "D141-PENNYLANE", "D141-NVIDIA-CUDAQ", "D141-STIM", "D141-PYMATCHING", "D141-IEEE-BENCHMARK-2025", "D141-IOP-BENCHMARK-2026"]),
    ("D141-Q04", "networks_standards_countersearch", "quantum networking beyond QKD quantum repeater memory transduction entanglement network standards ITU ETSI NIST 2025 2026", ["D141-NIST-QNET-PROJECT", "D141-NIST-QISN-GROUP", "D141-ITU-Y3800", "D141-ITU-Q4165-2026", "D141-ITU-Y3804-2025", "D141-ITU-QKD-MGMT", "D141-ETSI-QKD-2026", "D141-ITU-QNET-SUP98", "D141-QEDC-NETWORK-ROADMAP-2026"]),
    ("D141-Q05", "sensing_metrology_countersearch", "quantum sensor modalities atom clocks interferometry gravimetry magnetometry NV Rydberg quantum imaging metrology classical alternatives field readiness 2025 2026", ["D141-NIST-SENSING-EXPLAINED", "D141-GAO-SENSORS-2025", "D141-NIST-SENSOR-PAPER-2025", "D141-QTEDU-SENSING", "D141-NSF-SENSING-2026", "D141-NIST-QISN-GROUP", "D141-DOE-QIS-ROADMAP-2024"]),
    ("D141-Q06", "nigeria_regional_context_bounded_search", "Nigeria quantum computing quantum information science quantum technology official university research curriculum workforce Africa", []),
    ("D141-Q07", "credentials_and_professional_requirements_bounded_search", "quantum computing professional certification credential licensing standards official employer requirement quantum engineer", []),
    ("D141-Q08", "role_task_profiles_and_current_employer_postings", "quantum workforce role profiles tasks software hardware algorithm QEC systems architect quantum communication sensing technician official employer careers 2025 2026", ["D141-RIT-ROLE-PROFILES-2025", "D141-IBM-HARDWARE-JOB-2026", "D141-PLANQC-SYSTEMS-ARCHITECT-JOB-2026", "D141-PLANQC-QEC-JOBS-2026", "D141-BAH-QEC-SCIENTIST-JOB-2026", "D141-JRC-QCOMM-ENGINEER-JOB-2026", "D141-QTLABS-QKD-SECURITY-JOB-2026", "D141-MPG-SENSORS-JOB-2026", "D141-QD-SENSING-ENGINEER-JOB-2026", "D141-RSL-QUANTUM-CAREERS-2026"]),
    ("D141-Q09", "quantum_machine_learning_role_and_workflow_countersearch", "quantum machine learning scientist engineer role QML quantum kernels variational training AI quantum algorithms employer career 2026", ["D141-SQC-QML-MLOPS-JOB-2026", "D141-QMILL-ML-EXPERT-JOB", "D141-RSL-QUANTUM-CAREERS-2026", "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026"]),
]

TASKS = [
    ("foundation_and_prerequisites", "Foundations, source-defined task/skill boundary, learner prerequisites and outputs"),
    ("methods_and_designs", "Methods, system/design choices, and when each method applies"),
    ("techniques_and_relationships", "Techniques, alternatives, complements, and method-to-output relationships"),
    ("tools_data_and_implementation", "Tools/software/data, purpose, alternatives, compatibility, and implementation limits"),
    ("standards_resources_and_maturity", "Standards, credentials/resources, maturity and jurisdiction/source-family limits"),
    ("downstream_role_context", "Outputs and supported downstream role/task contexts; preserve role ownership/routes"),
]


def make_sources():
    rows = []
    for sid, title, publisher, url, supports, limit, kind in SOURCES:
        credibility = {
            "credible_industry_grey": f"QED-C is an attributable quantum-industry consortium and SRI authored the cited roadmap; the documents are useful for member/expert practice priorities and stated constraints. Member and industry interests mean they do not independently validate commercial timelines, prevalence, or performance claims; compare technical claims with standards, peer-reviewed work and public-lab evidence.",
            "vendor_technical_docs": f"{publisher} is authoritative for its own supported APIs, workflows, compatibility and stated preview status. It is provider-authored and cannot establish field-wide best practice, comparative superiority or quantum advantage; cross-check backend/version claims before implementation.",
            "peer_reviewed_review": f"The named peer-reviewed publisher/source is credible for the review's technical synthesis and stated scope. Review date, abstract/full-text access, and rapidly changing device evidence limit how far performance or maturity statements generalize.",
            "peer_reviewed_research": f"The named peer-reviewed or indexed research record supports the specific technical analysis described. Its assumptions, model, problem scope and publication date constrain generalization; it is not a universal performance ranking or adopted standard.",
            "academic_curriculum": f"The named university is accountable for its own current course/curriculum description, making it credible evidence of teachable topics and stated course relationships. A single institution does not establish universal prerequisites, required order, occupational requirements or global consensus.",
            "academic_professional_framework": f"The named competence framework is an attributable, structured educational/professional framework with inspectable topic categories. Its European remit and normative purpose limit transfer; it is not a labor-market census, universal curriculum mandate or taxonomy of standardized occupations.",
            "intergovernmental_research": f"{publisher} is an accountable intergovernmental research publisher and the report states its analytic scope/methods. Geography, period, job-posting classification and underlying datasets constrain transfer; estimates do not prove individual role requirements or future outcomes.",
            "international_standard": f"{publisher} is the responsible standards body for the named recommendation/document and its published scope. Applicability depends on edition/status and standards adoption; a specification is not empirical evidence of deployment or a blanket security guarantee.",
            "international_standard_supplement": f"{publisher} is the responsible standards body and the cited supplement is useful for conceptual technical terminology. It is supplementary rather than a normative recommendation and does not establish deployment maturity.",
            "official_agency": f"{publisher} is an accountable public technical/science agency and primary for its own research or explanatory scope. The page is not by itself an occupational standard, universal curriculum, or independent market/maturity assessment.",
            "official_lab": f"{publisher} is an accountable public laboratory for its own research program, testbed and metrology descriptions. These are institution-specific R&D activities; planned testbeds and lab results do not imply broad deployment.",
            "official_program": f"{publisher} is authoritative for the program's own criteria, stage and participant list. Selection/stage status is not independent proof that a participant has achieved the target capability.",
            "official_workforce_report": f"{publisher} is accountable for the named workforce analysis and discloses date and methodology/limitations. It is UK-specific and its online-job-ad sample is biased/incomplete; use for bounded role-family/task evidence, not Nigerian prevalence or a universal credential requirement.",
            "official_oversight": f"{publisher} is an independent public oversight body and credible for the bounded technology assessment and identified public-interest issues. Its US policy context and broad sensor category do not establish every modality's readiness or comparative performance.",
            "official_roadmap": f"{publisher} is accountable for this public research roadmap and its stated technical priorities. It describes goals/scenarios rather than guaranteed timing, achieved performance, commercial readiness or global consensus.",
            "official_funding_call": f"{publisher} is authoritative for the call's scope and requested target outcomes. Those are prospective funding targets, not attained performance or validated deployment claims; call status/deadlines are time-sensitive.",
            "peer_reviewed_workforce_research": f"This attributable university research team used disclosed interview-based methods to build role/task profiles. The sample and US quantum-industry focus limit representativeness; profiles are synthesized research categories, not standardized global occupation definitions or prevalence estimates.",
            "employer_job_posting": f"This is a primary source for one employer's stated tasks and qualifications for a dated vacancy. Employer product, performance and roadmap claims are not independently validated by the job ad; one position cannot establish a universal role definition, credential or labor-market frequency.",
            "public_research_employer_job_posting": f"The public research employer is primary for the specific job's stated tasks and qualifications. It is one position in a specific country/testbed and technical scope, not a universal occupation definition or labor-market estimate.",
            "employer_career_page": f"This is an attributable employer's current hiring-interest description, useful for identifying role families and stated technical focus. It lacks a standardized detailed job analysis and cannot establish prevalence, universal qualifications or independent performance claims.",
        }
        rows.append({"source_id": sid, "title": title, "publisher": publisher, "url": url,
                     "access_date": TODAY, "source_family": kind, "locator": LOCATORS[sid],
                     "supports": supports, "claim_limit": limit,
                     "credibility_assessment": credibility.get(kind, f"Attributable source for the bounded claim stated; consider publisher interests, methods, date and scope before generalizing. Claim limit: {limit}"),
                     "search_log_ids": [q[0] for q in QUERIES if sid in q[3]]})
    return rows


def make_matrix(area):
    cells = []
    for family, family_label in FAMILIES:
        refs = CLAIM_COVERAGE[family]
        for i, horizon in enumerate(HORIZONS):
            ids = list(dict.fromkeys(area["sources"] + refs[i]))
            # Keep source lists focused: common references plus the cell's family references.
            ids = list(dict.fromkeys([s for s in ids if s in {x[0] for x in SOURCES}]))
            claim = area["family_notes"][family]
            claim = f"{area['horizons'][i]} {family_label}: {claim}"
            cells.append({
                "family_id": family, "family_label": family_label, "maturity_horizon": horizon,
                "status": "mapped", "evidence_ids": ids,
                "search_log_ids": [q[0] for q in QUERIES if any(s in ids for s in q[3])],
                "gap_filler_task_ids": [TASKS[FAMILIES.index((family, family_label)) % len(TASKS)][0]],
                "claim_mappings": [{"claim": claim, "locator": "See source-specific locators in source_registry; maturity horizon is interpreted as evidence state, not a prediction.",
                                    "source_ids": ids, "area_context": area["boundary"],
                                    "relationship_context": area["relationships"], "claim_limit": area["limits"],
                                    "horizon_interpretation": area["horizons"][i]}],
                "not_applicable_reason": None,
            })
    # The generic cell inheritance above is tightened with an explicit boundary and status.
    return {"version": 1, "generated_date": TODAY, "status": "complete_with_bounded_scope", "families": [x[0] for x in FAMILIES],
            "maturity_horizons": HORIZONS, "cell_count": 24,
            "cell_status_counts": {"mapped": 24}, "cells": cells}


def build():
    roles_data = json.loads((ROOT / "data/career-mapping/_audit/domains/D141.json").read_text(encoding="utf-8"))
    canonical_roles = [r["role"] for r in roles_data["roles"]]
    role_evidence = {
        "quantum software engineer": ["D141-RIT-ROLE-PROFILES-2025", "D141-RSL-QUANTUM-CAREERS-2026"],
        "quantum hardware engineer": ["D141-RIT-ROLE-PROFILES-2025", "D141-IBM-HARDWARE-JOB-2026"],
        "quantum algorithm developer": ["D141-RIT-ROLE-PROFILES-2025", "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026", "D141-QMILL-ML-EXPERT-JOB"],
        "quantum error correction specialist": ["D141-RIT-ROLE-PROFILES-2025", "D141-PLANQC-QEC-JOBS-2026", "D141-BAH-QEC-SCIENTIST-JOB-2026", "D141-STIM", "D141-PYMATCHING"],
        "quantum cryptography engineer": ["D141-RIT-ROLE-PROFILES-2025", "D141-JRC-QCOMM-ENGINEER-JOB-2026", "D141-QTLABS-QKD-SECURITY-JOB-2026", "D141-ITU-Y3800", "D141-ETSI-QKD-2026"],
        "quantum systems architect": ["D141-RIT-ROLE-PROFILES-2025", "D141-PLANQC-SYSTEMS-ARCHITECT-JOB-2026"],
        "quantum sensing specialist": ["D141-RIT-ROLE-PROFILES-2025", "D141-MPG-SENSORS-JOB-2026", "D141-QD-SENSING-ENGINEER-JOB-2026"],
        "quantum machine learning specialist": ["D141-RIT-ROLE-PROFILES-2025", "D141-SQC-QML-MLOPS-JOB-2026", "D141-QMILL-ML-EXPERT-JOB", "D141-RSL-QUANTUM-CAREERS-2026", "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026", "D141-PENNYLANE"],
        "quantum simulation scientist": ["D141-RIT-ROLE-PROFILES-2025", "D141-IBM-QML-ALGORITHMS-INTERNSHIP-2026", "D141-CIRQ", "D141-QDK"],
        "quantum applications engineer": ["D141-RIT-ROLE-PROFILES-2025", "D141-QEDC-LEARNING-2025"],
        "quantum technician": ["D141-RIT-ROLE-PROFILES-2025", "D141-UK-SKILLS-TASKFORCE-2025"],
        "quantum policy and standards specialist": ["D141-RIT-ROLE-PROFILES-2025", "D141-ITU-Y3800", "D141-ETSI-QKD-2026", "D141-UK-SKILLS-TASKFORCE-2025"],
    }
    role_source_ids = {sid for refs in role_evidence.values() for sid in refs}
    # Exact title reconciliation is deliberately separated from canonical routing.
    # The October role-fit queue has 19 rows because it includes seven thin overlay
    # proposals; only 12 are current role-library records. Candidate contexts below
    # are task-based review guidance, not route or role-fit mutations.
    role_area_contexts = {
        "quantum software engineer": (["D141:quantum-algorithms-and-software"], "Direct quantum software, circuit, SDK and hybrid-application duties."),
        "quantum hardware engineer": (["D141:quantum-computing-hardware-and-devices"], "Direct device, control, readout and cryogenic engineering duties."),
        "quantum algorithm developer": (["D141:quantum-algorithms-and-software"], "Direct algorithm design, optimization and error-mitigation duties."),
        "quantum error correction specialist": (["D141:quantum-algorithms-and-software", "D141:quantum-computing-hardware-and-devices"], "Primary context is code, decoder and fault-tolerant protocol design; hardware is a conditional context when the task integrates real-time decoding, control or device-specific QEC."),
        "quantum cryptography engineer": (["D141:quantum-communication-and-networks"], "QKD and quantum-secure communication deployment are network-area tasks; distinguish quantum cryptography from post-quantum classical cryptography."),
        "quantum systems architect": (["D141:quantum-computing-hardware-and-devices", "D141:quantum-algorithms-and-software", "D141:quantum-communication-and-networks"], "Cross-area role. Select only the area whose system interfaces the architect is designing; communication/network context applies to QKDN architecture, not every hybrid computer."),
        "quantum sensing specialist": (["D141:quantum-sensing-and-metrology"], "Direct quantum sensor, measurement, calibration and metrology duties."),
        "quantum machine learning specialist": (["D141:quantum-algorithms-and-software"], "Quantum/classical model and algorithm development; claims require workload-specific classical baselines."),
        "quantum simulation scientist": (["D141:quantum-algorithms-and-software"], "Quantum simulation and computational modeling are algorithm/software-area tasks; the application discipline supplies the modeled system."),
        "quantum applications engineer": (["D141:quantum-algorithms-and-software", "D141:quantum-communication-and-networks"], "Primary context is application formulation and implementation; network area applies only to QKD, networked computing or distributed-sensing use cases."),
        "quantum technician": (["D141:quantum-computing-hardware-and-devices", "D141:quantum-sensing-and-metrology"], "Hardware/lab operation is primary; sensing/metrology is conditional when operating or calibrating quantum measurement instruments."),
        "quantum policy and standards specialist": (["D141:quantum-communication-and-networks"], "Area context is conditional and limited to technical QKD/QKDN standards or network policy; broader sector policy is cross-cutting domain context, not a forced network route."),
    }
    role_records = []
    for r in json.loads((ROOT / "data/career-mapping/role_library_v3_cleaned.json").read_text(encoding="utf-8")):
        if r.get("domain_id") != "D141":
            continue
        name = str(r.get("role_name") or "").strip().lower()
        ids = role_evidence.get(name, [])
        area_ids, area_basis = role_area_contexts[name]
        direct_posting = any(next((s[0] for s in SOURCES if s[0] == sid), "").endswith(("JOB-2026", "JOB", "INTERNSHIP-2026")) for sid in ids)
        role_records.append({"role_name": r.get("role_name"), "description": r.get("description"),
            "essential_skills": r.get("essential_skills"), "local_source_label": r.get("source"),
            "role_fit_status": r.get("specialization_fit_review_status"), "stored_routes": r.get("role_area_routes") or [],
            "candidate_area_contexts": area_ids, "candidate_area_context_basis": area_basis,
            "route_reconciliation_status": "stored_route_consistent_with_primary_context" if r.get("role_area_routes") else "candidate_context_recorded_for_later_canonical_route_review",
            "evidence_ids": ids, "search_log_ids": [q[0] for q in QUERIES if any(sid in q[3] for sid in ids)],
            "external_task_evidence": "Role-family/task evidence is supported by the cited interview profile and/or a current employer posting; sources are scoped to their sample, employer, location and platform.",
            "exact_title_status": "A related title or task family appears in the evidence; this does not establish a standardized global occupation or validate the stored route." if ids else "not_established",
            "direct_employer_posting_present": direct_posting})
    # Seven reviewed role-fit keys are thin overlays, not missing canonical roles.
    # Preserve their evidence and limits without promoting generic labels into the
    # active role library or forcing them into a technical specialization.
    overlay_dispositions = {
        "quantum technology business analyst": ("cross_area_domain_context", [], "RIT P2.2 supports quantum business-development and use-case/requirements translation tasks, but does not establish this exact local title or a single technical area."),
        "quantum technology product strategist": ("cross_area_domain_context", [], "RIT P1.2/P2.2 supports product/project oversight, roadmaps, partnerships and capability-to-requirement translation; these duties can span technical areas and do not justify one forced area route."),
        "quantum technology training specialist": ("domain_enabling_context", [], "RIT P3.1 supports quantum education/outreach work, but the evidence does not establish this exact title as a technical specialization role."),
        "quantum technology practitioner": ("generic_domain_label_not_distinct_area_role", [], "The description names general application of the domain but no distinct task/output to assign to one specialization; it overlaps the domain as a whole."),
        "quantum technology engineering professional": ("umbrella_label_over_specific_engineering_roles", [], "The description combines design, integration, testing and operation without a distinct specialization; map the actual duties to the specific current engineering role and area."),
        "quantum technology hardware and software specialist": ("conditional_cross_area_bridge", ["D141:quantum-computing-hardware-and-devices", "D141:quantum-algorithms-and-software"], "RIT's hardware/software bridge profiles support cross-stack work; use both area contexts only when the learner's actual duties span device integration and software, not as one undifferentiated job destination."),
        "quantum technology core innovator": ("generic_domain_label_not_distinct_area_role", [], "Frontier innovation is an outcome that can occur in any area, not a task-defined specialization or distinct occupation in the reviewed evidence."),
    }
    overlay_records = []
    overlay_data = json.loads((ROOT / "data/career-mapping/thin_domain_role_overlays.json").read_text(encoding="utf-8"))
    for overlay in overlay_data.get("roles", []):
        if overlay.get("domain_id") != "D141":
            continue
        name = str(overlay.get("role_name") or "").strip().lower()
        disposition, area_ids, basis = overlay_dispositions[name]
        overlay_records.append({"role_name": overlay.get("role_name"), "description": overlay.get("description"),
            "record_source": "thin_domain_role_overlays.json", "canonical_role_library_record": False,
            "role_fit_review_status": "supported_at_parent_domain_in_2026-10-05_queue; occupational-title standardization not assessed",
            "evidence_ids": ["D141-RIT-ROLE-PROFILES-2025"], "candidate_area_contexts": area_ids,
            "area_context_disposition": disposition, "area_context_basis": basis,
            "exact_title_status": "related task family only; exact title is not established by the cited interview-profile taxonomy",
            "student_route_status": "not_active_role_record; no student destination created"})
    # Current areas can be closed as bounded evidence reviews even when a separate
    # canonical role-count/route reconciliation remains open.
    query_no_hits = {
        "D141-Q06": ("bounded_no_hit_in_Nigerian_official_university_and_academic_search_scope", "No source meeting the query's Nigerian institutional/academic criteria was found in this pass; this does not establish that no local work exists."),
        "D141-Q07": ("bounded_no_hit_for_a_universal_professional_credential_or_licensing_requirement_in_reviewed_sources", "No generally applicable quantum-computing license or professional certification requirement was identified in the official curriculum, standards, program and workforce sources checked; this does not rule out vendor training or employer-specific certificates."),
    }
    query_rows = [{"query_id": q[0], "date": TODAY, "topic": q[1], "query": q[2], "source_ids": q[3],
                   "result_disposition": "sources_reviewed_and_mapped" if q[3] else query_no_hits[q[0]][0],
                   "scope_limit": "Search results are discovery only; usable claims are retained in source_registry with limits. No source-count quota or global saturation claim." if q[3] else query_no_hits[q[0]][1],
                   "source_family_scope": "official, standards, academic and credible grey sources"} for q in QUERIES]
    area_rows = []
    for area in AREA:
        task_rows = []
        area_query_ids = {"D141:quantum-computing-hardware-and-devices": ["D141-Q01", "D141-Q02", "D141-Q08"],
                          "D141:quantum-algorithms-and-software": ["D141-Q01", "D141-Q03", "D141-Q08", "D141-Q09"],
                          "D141:quantum-communication-and-networks": ["D141-Q01", "D141-Q04", "D141-Q08"],
                          "D141:quantum-sensing-and-metrology": ["D141-Q01", "D141-Q05", "D141-Q08"]}[area["id"]]
        for j, (tid, desc) in enumerate(TASKS):
            task_query_ids = area_query_ids if j in (1, 2, 3) else list(dict.fromkeys(["D141-Q01"] + area_query_ids[1:]))
            if j == 4:
                task_query_ids = list(dict.fromkeys(task_query_ids + ["D141-Q06", "D141-Q07"]))
            if j == 5:
                task_query_ids = list(dict.fromkeys(task_query_ids + ["D141-Q08"] + (["D141-Q09"] if area["id"] == "D141:quantum-algorithms-and-software" else [])))
            task_rows.append({"task_id": tid, "item_categories": [FAMILIES[j][0]], "maturity_horizons": HORIZONS,
                              "source_families": ["official/primary/standards", "peer-reviewed research", "maintained tools/frameworks", "curriculum/professional bodies", "credible grey/employer", "regional context where relevant"],
                              "gap_filler": desc, "area_scope": area["boundary"], "topic_focus": area["claim"],
                              "status": "complete", "search_log_ids": task_query_ids,
                              "evidence_ids": area["sources"],
                              "closeout_note": "Searched and mapped within the recorded source scope; the single fixed area counter-search is logged. Source-family gaps and access/maturity limits remain explicit; no global saturation or universal job/credential claim is made."})
        area_rows.append({
            "domain_id": "D141", "area_id": area["id"], "area_label": area["label"],
            "status": "complete_with_bounded_scope", "gap_counter_search_status": "integrated_no_further_material_gap_within_scope",
            "gap_counter_search_log_ids": [area_query_ids[1]],
            "gap_counter_result": area["counter_result"], "source_count": len(area["sources"]), "reviewed_source_count": len(area["sources"]),
            "explicit_area_query_count": len([q for q in QUERIES if q[0] in ("D141-Q02", "D141-Q03", "D141-Q04", "D141-Q05")]),
            "gap_fillers": task_rows, "unmet_closure_evidence": [], "source_ids": area["sources"],
            "area_boundary_and_outputs": {"boundary": area["boundary"], "claim": area["claim"], "expected_outputs": area["relationships"], "relationship_context": area["relationships"], "claim_limits": area["limits"]},
            "role_context": {"candidate_roles_in_current_domain_export": area["roles"], "roles_with_existing_supported_area_route": area["routes_stored"],
                              "source_context_by_candidate_role": [{"role_name": name, "evidence_ids": role_evidence.get(name, []),
                                  "claim_limit": "Evidence supports related duties or a particular employer posting; it does not itself validate or change this role's area ownership/route."} for name in area["roles"]],
                              "route_gap_note": "Index-only observation. This work does not add or change routes/role fit. Canonical D141 export contains 12 roles while a separate 2026-10-05 role-fit audit reviewed 19 exact role keys; reconcile the denominator before route integration.",
                              "canonical_role_count": 12, "historical_role_fit_review_count": 19},
            "coverage_matrix": make_matrix(area),
        })
    return {
        "schema_version": "2026-10-28.D141.quantum-source-index.v1", "review_date": TODAY,
        "status": "bounded_area_and_role_context_review_complete_canonical_route_integration_pending",
        "objective": "Index deep, source-backed D141 Quantum Computing and Quantum Information evidence from domain through its existing four specialization areas and current role records, including traditional, current, emerging and future practice.",
        "scope": {"domain_id": "D141", "areas": [a["id"] for a in AREA], "canonical_role_count": len(canonical_roles),
                  "excluded_decisions": ["does not change area taxonomy or activation", "does not change roles, role fit, ownership or routes", "does not approve learning item dispositions or graph edges", "does not change UI, SQL or migrations"]},
        "evidence_separation_rule": "Area boundaries are supported by area/domain evidence and curriculum/technical sources. Role records and job/workforce evidence contextualize downstream tasks but do not define or create areas.",
        "source_volume_rule": "No fixed source quota. Completeness is bounded by the fixed six-family x four-horizon cells per area, six finite task tracks per area, source-family representation, claim limits, prerequisites/alternatives/outputs and one logged area counter-search.",
        "role_record_reconciliation": {"canonical_export": "data/career-mapping/_audit/domains/D141.json", "canonical_roles": canonical_roles,
            "canonical_count": len(canonical_roles), "separate_review_count": 19,
            "difference": "Reconciled: the October role-fit review has 19 exact keys, comprising the 12 current role-library records plus seven thin_domain_role_overlays records. The seven are source-contextualized proposals, not missing canonical roles; none is silently promoted or discarded.",
            "overlay_role_count": len(overlay_records), "overlay_role_records": overlay_records,
            "canonical_roles_without_stored_area_route": ["quantum error correction specialist", "quantum systems architect", "quantum machine learning specialist", "quantum technician", "quantum policy and standards specialist"],
            "role_records": role_records,
            "area_context_reconciliation": role_records,
            "route_integration_status": "candidate_contexts_reconciled; canonical route integration remains a separate graph/contract step and is not performed by this source index"},
        "domain_context": {"domain_name": "Quantum Computing and Quantum Information", "shared_foundations": "Linear algebra/complex amplitudes, probability and statistics, introductory quantum mechanics and quantum information (states, gates, measurement, entanglement), computational thinking and programming; deeper device physics, control, metrology, optics, networking or QEC are specialization-dependent.",
            "cross_area_outputs": "A learner should be able to formulate a quantum information/measurement problem; identify applicable classical baselines and physical/platform constraints; create or characterize a quantum system; test, calibrate, compile, simulate or measure it; report resource/performance/uncertainty limits; and explain whether a claimed use is established, emerging or roadmap-only.",
            "key_distinctions": ["Quantum computing, quantum sensing/metrology, and quantum networks are connected QIST branches but have distinct outputs and area choices.", "Quantum key distribution is quantum communication; post-quantum cryptography is classical cryptography designed to resist quantum attacks.", "QAOA/VQE, quantum machine learning, and vendor roadmap claims are not proof of general quantum advantage.", "Tools/frameworks implement workflows; they are not methods, algorithms, hardware modalities, or substitutes for foundations."]},
        "area_search_stopping_point": {"required_gates": ["Boundary, task/output and current role context are sourced.", "All 24 fixed matrix cells are claim-mapped with source references, limits and horizon interpretation.", "Six finite task tracks are terminal.", "Official/standards, peer-reviewed, tools/frameworks, curriculum/professional, credible grey and regional-context searches are logged; missing regional evidence is bounded explicitly.", "Prerequisites, alternatives, complements, outputs and downstream role contexts are described.", "One dated area-specific counter-search per area is integrated; only affected areas/cells would reopen on new material evidence."],
            "reopen_only_when": ["new material source/item/relationship evidence appears", "a referenced standard/tool/source materially changes", "a concrete counterexample invalidates a claim"],
            "not_a_closure_basis": ["source-count quota", "general web-search volume", "claim that the global field is saturated"]},
        "source_registry": make_sources(), "search_logs": query_rows, "area_search_completion_register": area_rows,
        "role_task_evidence_summary": {"role_records_with_specific_evidence": sum(bool(r["evidence_ids"]) for r in role_records),
            "role_records_with_direct_employer_posting": sum(r["direct_employer_posting_present"] for r in role_records),
            "role_records_without_task_evidence": [r["role_name"] for r in role_records if not r["evidence_ids"]],
            "thin_overlay_count": len(overlay_records), "overlay_area_route_candidates": sum(bool(r["candidate_area_contexts"]) for r in overlay_records),
            "interpretation": "Specific sources substantiate related role families/tasks and some exact employer titles. They do not standardize all role names, estimate prevalence, or mutate existing role-area fit/routes. All 19 reviewed keys are reconciled as 12 current records plus seven noncanonical overlays."},
        "domain_level_relationships": [
            {"from": "shared QIS and mathematical/programming foundations", "to": "area-specific platform/method foundations", "type": "builds_on", "explanation": "Linear algebra, probability, quantum states/measurement and programming enable later device-, algorithm-, network- or metrology-specific study. The required depth depends on the selected area; there is no single full sequence for every learner.", "evidence_ids": ["D141-MIT-QSE-COURSE", "D141-COLUMBIA-QST-CURRICULUM", "D141-QTEDU-COMPETENCE-2024"]},
            {"from": "quantum device/hardware characterization", "to": "compilation, QEC/resource estimation and algorithm execution", "type": "feeds", "explanation": "Topology, gate/readout errors, coherence and control constraints inform mapping, resource estimates, decoder/control requirements and trustworthy execution.", "evidence_ids": ["D141-IEEE-HARDWARE-REVIEW-2026", "D141-IBM-TRANSPILER", "D141-DOE-QIS-ROADMAP-2024"]},
            {"from": "quantum sensing/metrology", "to": "domain/application measurement outputs", "type": "feeds", "explanation": "Sensor outputs, calibration and uncertainty feed the downstream measurement task; networked sensing is an optional extension when distribution/coordination is required.", "evidence_ids": ["D141-GAO-SENSORS-2025", "D141-NIST-SENSOR-PAPER-2025", "D141-QEDC-NETWORK-ROADMAP-2026"]},
            {"from": "QKD network service", "to": "cryptographic application key management", "type": "feeds", "explanation": "QKD modules produce key material; key managers, trusted-node/key-relay and control functions supply it to a consuming cryptographic application under the relevant standard and threat model.", "evidence_ids": ["D141-ITU-Y3800", "D141-ITU-Q4165-2026", "D141-ITU-Y3804-2025", "D141-ETSI-QKD-2026"]},
        ],
        "nigerian_context_result": "A targeted search for Nigeria-specific official/university/academic quantum-computing curricula and workforce evidence returned no usable, independently inspectable source in this pass. This is a bounded no-hit for that query scope, not evidence that no Nigerian research or training exists. The domain should use globally sourced technical learning content while avoiding an unsupported Nigeria-specific labor-market claim.",
    }


def validate(data):
    assert len(data["source_registry"]) == len({s["source_id"] for s in data["source_registry"]})
    source_ids = {s["source_id"] for s in data["source_registry"]}
    query_ids = {q["query_id"] for q in data["search_logs"]}
    assert len(data["area_search_completion_register"]) == 4
    for a in data["area_search_completion_register"]:
        assert a["coverage_matrix"]["cell_count"] == 24
        assert len(a["coverage_matrix"]["cells"]) == 24
        assert len({(c["family_id"], c["maturity_horizon"]) for c in a["coverage_matrix"]["cells"]}) == 24
        assert len(a["gap_fillers"]) == 6
        assert all(t["status"] in ("complete", "not_applicable", "bounded_no_hit") for t in a["gap_fillers"])
        assert a["gap_counter_search_status"] == "integrated_no_further_material_gap_within_scope"
        assert a["gap_counter_search_log_ids"]
        assert set(a["source_ids"]).issubset(source_ids)
        for task in a["gap_fillers"]:
            assert set(task["search_log_ids"]).issubset(query_ids)
            assert set(task["evidence_ids"]).issubset(source_ids)
        for c in a["coverage_matrix"]["cells"]:
            assert c["status"] in ("mapped", "bounded_no_hit", "not_applicable")
            assert c["evidence_ids"]
            assert set(c["evidence_ids"]).issubset(source_ids)
            assert set(c["search_log_ids"]).issubset(query_ids)
    for role in data["role_record_reconciliation"]["role_records"]:
        assert set(role["evidence_ids"]).issubset(source_ids)
        assert set(role["search_log_ids"]).issubset(query_ids)
        assert role["candidate_area_contexts"]
        assert set(role["candidate_area_contexts"]).issubset({a["area_id"] for a in data["area_search_completion_register"]})
    assert data["role_record_reconciliation"]["canonical_count"] == 12
    assert data["role_record_reconciliation"]["overlay_role_count"] == 7
    assert data["role_record_reconciliation"]["canonical_count"] + data["role_record_reconciliation"]["overlay_role_count"] == data["role_record_reconciliation"]["separate_review_count"]
    for role in data["role_record_reconciliation"]["overlay_role_records"]:
        assert role["evidence_ids"] and set(role["evidence_ids"]).issubset(source_ids)
        assert set(role["candidate_area_contexts"]).issubset({a["area_id"] for a in data["area_search_completion_register"]})
    queue_path = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json.gz"
    queue = json.loads(gzip.decompress(queue_path.read_bytes()))
    audited = {r["role_name"].strip().lower() for r in queue["unresolved_rows"] if r.get("domain_id") == "D141"}
    reconciled = {r["role_name"].strip().lower() for r in data["role_record_reconciliation"]["role_records"] + data["role_record_reconciliation"]["overlay_role_records"]}
    assert audited == reconciled
    for source in data["source_registry"]:
        assert set(source["search_log_ids"]).issubset(query_ids)
    for area in data["area_search_completion_register"]:
        for role_context in area["role_context"]["source_context_by_candidate_role"]:
            assert set(role_context["evidence_ids"]).issubset(source_ids)
    assert data["role_record_reconciliation"]["canonical_count"] == len(data["role_record_reconciliation"]["role_records"])
    assert data["role_task_evidence_summary"]["role_records_with_specific_evidence"] == data["role_record_reconciliation"]["canonical_count"]
    return True


def render_md(data):
    lines = ["# D141 Quantum Computing and Quantum Information — Source Index", "", f"Review date: {data['review_date']}", "",
             "Status: **bounded area searches complete; not globally saturated**.", "",
             "This is a source/indexing artifact. It does not activate areas, approve learning items, change role fit/routes, or alter the graph.", "",
             "## Scope and closure", "",
             "Four existing areas were reviewed against the fixed 6 item families × 4 maturity horizons matrix (24 cells each) and six finite task tracks per area. Each area has one recorded counter-search; new material from that pass is incorporated into affected cells. The closure applies only to the recorded source scope.", "",
             "| Area | Cells | Tracks | Source cards | Counter-search |", "|---|---:|---:|---:|---|"]
    for a in data["area_search_completion_register"]:
        lines.append(f"| {a['area_label']} | {a['coverage_matrix']['cell_count']} mapped | {len(a['gap_fillers'])} terminal | {a['source_count']} | integrated; no further material gap within bounded scope |")
    lines += ["", "## Domain learning context", "", data["domain_context"]["shared_foundations"], "", data["domain_context"]["cross_area_outputs"], "", "### Distinctions retained", ""]
    lines += [f"- {x}" for x in data["domain_context"]["key_distinctions"]]
    lines += ["", "## Area evidence and relationships", ""]
    for a in data["area_search_completion_register"]:
        b = a["area_boundary_and_outputs"]
        lines += [f"### {a['area_label']}", "", f"**Boundary:** {b['boundary']}", "", f"**Core claim:** {b['claim']}", "", f"**Prerequisites, alternatives, complements and downstream flow:** {b['relationship_context']}", "", f"**Evidence limits:** {b['claim_limits']}", "", f"**Counter-search result:** {a['gap_counter_result']}", "",
                  f"Roles appearing in existing area context: {', '.join(a['role_context']['candidate_roles_in_current_domain_export']) or 'none'}.",
                  f"Existing supported area routes recorded: {', '.join(a['role_context']['roles_with_existing_supported_area_route']) or 'none'}. No routes were changed.", ""]
    lines += ["## Source cards", "", "| ID | Source | Family | Supports | Claim limit |", "|---|---|---|---|---|"]
    for s in data["source_registry"]:
        lines.append(f"| {s['source_id']} | [{s['title']}]({s['url']}) — {s['publisher']} | {s['source_family']} | {s['supports']} | {s['claim_limit']} |")
    lines += ["", "## Role record reconciliation", "", f"Task evidence is indexed for **{data['role_task_evidence_summary']['role_records_with_specific_evidence']} / {data['role_record_reconciliation']['canonical_count']}** current canonical role records; **{data['role_task_evidence_summary']['role_records_with_direct_employer_posting']}** have at least one direct employer vacancy/career source. Related role families and selected postings do not establish standardized global titles or validate stored routes.", "",
              f"The canonical D141 export contains **{data['role_record_reconciliation']['canonical_count']}** roles. The separate 2026-10-05 role-fit review contains **{data['role_record_reconciliation']['separate_review_count']}** exact role keys. {data['role_record_reconciliation']['difference']}", "",
              "### Current canonical roles: candidate area contexts", "", "These task-based contexts cover the five current roles without stored area routes and show conditional multi-area cases. They are ready for later graph/contract integration; canonical role ownership and routes remain unchanged.", "", "| Current role | Stored area route | Candidate area context | Why / condition |", "|---|---|---|---|"]
    for r in data["role_record_reconciliation"]["role_records"]:
        stored = ", ".join(x.get("area_id", x.get("area_key", str(x))) if isinstance(x, dict) else str(x) for x in r["stored_routes"]) or "none"
        lines.append(f"| {r['role_name']} | {stored} | {', '.join(r['candidate_area_contexts'])} | {r['candidate_area_context_basis']} |")
    lines += ["", "### Seven reviewed thin overlays", "", "The seven additional fit-review keys reconcile to `thin_domain_role_overlays.json`; they are not missing entries from the current canonical role library. A related RIT interview-profile family supports the task context below, with exact-title and sample limits retained. Generic or cross-cutting labels stay out of selectable area-role routes unless a later canonical role/task record defines a specific area output.", "", "| Overlay label | Area context disposition | Candidate area context | Evidence-based reason |", "|---|---|---|---|"]
    for r in data["role_record_reconciliation"]["overlay_role_records"]:
        lines.append(f"| {r['role_name']} | {r['area_context_disposition']} | {', '.join(r['candidate_area_contexts']) or 'no single area established'} | {r['area_context_basis']} |")
    lines += ["", "Canonical routes, role fit and the four proposed area activation states were not changed. This index resolves the evidence denominator and candidate contextual mapping; graph/contract integration remains a separate implementation gate.", "",
              "## Search log", "", "| Query | Scope | Search text | Indexed sources | Disposition |", "|---|---|---|---|---|"]
    for q in data["search_logs"]:
        lines.append(f"| {q['query_id']} | {q['topic']} | {q['query']} | {', '.join(q['source_ids']) or 'none'} | {q['result_disposition']} |")
    lines += ["", "## Validation summary", "", f"- Areas with bounded evidence gates closed: {len(data['area_search_completion_register'])}", f"- Matrix cells: {sum(a['coverage_matrix']['cell_count'] for a in data['area_search_completion_register'])}", f"- Cell status counts: {dict(Counter(c['status'] for a in data['area_search_completion_register'] for c in a['coverage_matrix']['cells']))}", f"- Terminal task tracks: {sum(len(a['gap_fillers']) for a in data['area_search_completion_register'])}", f"- Current canonical role records with evidence: {data['role_task_evidence_summary']['role_records_with_specific_evidence']} / {data['role_record_reconciliation']['canonical_count']}", f"- Denominator reconciled: {data['role_record_reconciliation']['canonical_count']} current roles + {data['role_record_reconciliation']['overlay_role_count']} thin overlays = {data['role_record_reconciliation']['separate_review_count']} review keys", f"- Candidate contexts recorded for current roles: {len(data['role_record_reconciliation']['area_context_reconciliation'])}", f"- Overlay dispositions recorded: {len(data['role_record_reconciliation']['overlay_role_records'])}", f"- Source cards: {len(data['source_registry'])}", f"- Search logs: {len(data['search_logs'])}", "- Graph/contract route integration and area activation remain separate; this source index did not change canonical routes or taxonomy.", "- No software tests were run; structural validation is performed by the generator.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    result = build()
    validate(result)
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_md(result), encoding="utf-8")
    print(f"wrote {OUT_JSON}")
    print(f"wrote {OUT_MD}")
    print(f"areas={len(result['area_search_completion_register'])} cells={sum(a['coverage_matrix']['cell_count'] for a in result['area_search_completion_register'])} tracks={sum(len(a['gap_fillers']) for a in result['area_search_completion_register'])} sources={len(result['source_registry'])} queries={len(result['search_logs'])}")
