/**
 * Sifter Skill_Up — Field Details Registry v2
 * ALL 29 fields populated with GENERAL / SPECIFIC track trees
 * Source: Sifter_SkillUp_Master_Role_Directory
 *
 * Status:
 *   live         = content exists, navigates to real lessons
 *   coming_soon  = track defined, navigates to WorldScreen lock state
 */

export type TrackType   = 'GENERAL' | 'SPECIFIC';
export type TrackStatus = 'live' | 'coming_soon';

export interface FieldSkillTrack {
  id: string;
  name: string;
  type: TrackType;
  worldThemeId: string;
  worldLabel: string;
  tagline: string;
  description: string;
  status: TrackStatus;
  navigateTo?: 'Quant' | 'CryptoMap' | 'IslandMap' | 'StarknetTrack' | 'World';
}

export interface FieldDetail {
  fieldId: string;
  worldThemeId: string;
  worldName: string;
  worldDescription: string;
  requirements: string[];
  generalTracks: FieldSkillTrack[];
  specificTracks: FieldSkillTrack[];
}

const registry: FieldDetail[] = [

  // ── 01. CRYPTO / WEB3 ────────────────────────────────────────────────────
  {
    fieldId: 'crypto',
    worldThemeId: 'blockchain-borough',
    worldName: 'Blockchain Borough',
    worldDescription: 'A decentralised city where every transaction is public and self-custody is king.',
    requirements: [
      'Comfort with wallets, private keys, and basic on-chain concepts',
      'Willingness to go deep on one niche — DeFi, security, dev, or research',
      'Pseudonymous environment — Telegram, Discord, and X are your office',
      'Tolerance for market cycles and company instability',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'defi-research-analyst', name: 'DeFi Research Analyst', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🌊 Yield Islands', tagline: 'Read protocols like balance sheets', description: 'Analyse DeFi protocols — TVL, yield sources, risk profiles, tokenomics. Produce investment-grade research.', status: 'live', navigateTo: 'CryptoMap' },
      { id: 'onchain-analyst', name: 'On-Chain Analyst', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🔍 Chain Observatory', tagline: 'Follow the money on-chain', description: 'Track whale wallets, smart money flows, funding rates. Turn on-chain data into trading intelligence.', status: 'live', navigateTo: 'CryptoMap' },
      { id: 'smart-contract-dev', name: 'Smart Contract Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '⚙️ Contract Forge', tagline: 'Write code that holds real money', description: 'Build and audit smart contracts in Solidity (EVM) or Rust (Solana). DeFi protocols, NFTs, and DAOs.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'blockchain-auditor', name: 'Blockchain Security Auditor', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🛡️ Audit Citadel', tagline: 'Find bugs before hackers do', description: 'Identify critical vulnerabilities in smart contracts. Every audit is a race against real economic loss.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'crypto-compliance', name: 'Crypto Compliance Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '⚖️ Compliance Court', tagline: 'Keep the industry legitimate', description: 'Navigate AML/KYC obligations, sanctions screening, and evolving crypto regulatory frameworks.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'web3-pm', name: 'Web3 Product Manager', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🧭 Product District', tagline: 'Ship products with millions at stake', description: 'Define and drive product strategy for blockchain protocols, wallets, and DeFi applications.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'tokenomics-designer', name: 'Tokenomics Designer', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🪙 Token Lab', tagline: 'Design the economics of new money', description: 'Model token supply, distribution, incentive mechanisms, and governance structures for crypto protocols.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'dao-governance', name: 'DAO Governance Analyst', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🏛️ Governance Hall', tagline: 'Run organisations with code', description: 'Design and analyse DAO governance structures, voting mechanisms, treasury management, and protocol politics.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 02. QUANTITATIVE FINANCE ─────────────────────────────────────────────
  {
    fieldId: 'quant',
    worldThemeId: 'quant-quarter',
    worldName: 'Quant Quarter',
    worldDescription: 'High-stakes arena where mathematics, code, and market microstructure meet at the speed of light.',
    requirements: [
      'Strong mathematics — probability, statistics, linear algebra',
      'Python and/or C++ proficiency',
      'Mental maths and fast reasoning for trader roles',
      'Graduate degree preferred at top-tier quant firms',
    ],
    generalTracks: [
      { id: 'quant-trader', name: 'Quant Trader', type: 'GENERAL', worldThemeId: 'quant-quarter', worldLabel: '🎲 Trading Pit', tagline: 'Math meets market instinct', description: 'Trade systematic or discretionary strategies. Brainteaser-heavy interviews. Jane Street, Citadel, Jump.', status: 'live', navigateTo: 'Quant' },
      { id: 'quant-developer', name: 'Quant Developer', type: 'GENERAL', worldThemeId: 'quant-quarter', worldLabel: '💻 Algorithm Alley', tagline: 'Build the infrastructure that trades billions', description: 'Develop low-latency systems, data pipelines, and trading infrastructure. C++ and Python depth required.', status: 'live', navigateTo: 'Quant' },
      { id: 'quant-researcher', name: 'Quant Researcher', type: 'GENERAL', worldThemeId: 'quant-quarter', worldLabel: '🔬 Research Lab', tagline: 'Find statistical edge in market data', description: 'Research, backtest, and productionise systematic trading strategies. Statistics, time series, ML at the core.', status: 'live', navigateTo: 'Quant' },
    ],
    specificTracks: [
      { id: 'financial-engineer', name: 'Financial Engineer', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📐 Derivatives Den', tagline: 'Price complexity', description: 'Derivatives pricing, stochastic calculus, numerical methods. Build pricing models at banks and hedge funds.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'derivatives-trader', name: 'Derivatives Trader', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📊 Options Floor', tagline: 'Trade structured risk', description: 'Price and trade equity derivatives, options, swaps. Greeks, vol surface, skew. Banks and specialist shops.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'risk-analyst-quant', name: 'Risk Analyst — Quant', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '🌡️ Risk Radar', tagline: 'Measure what can go wrong', description: 'VaR, Expected Shortfall, stress testing, Basel framework. Quantify portfolio and counterparty risk.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'actuarial-analyst', name: 'Actuarial Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📊 Actuarial Archive', tagline: 'Price uncertainty for a living', description: 'Structured exam progression (CAS/SOA). Model insurance risk, life tables, pension liabilities.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'portfolio-analyst', name: 'Portfolio Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📈 Portfolio Tower', tagline: 'Optimise what is owned', description: 'Portfolio construction, factor models, attribution analysis, rebalancing. Asset managers and family offices.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'options-trader', name: 'Options Trader', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '🎯 Options Pit', tagline: 'Defined risk, asymmetric upside', description: 'Calls, puts, spreads, Greeks, implied volatility on Deribit and exchange floors.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 03. AI & MACHINE LEARNING ────────────────────────────────────────────
  {
    fieldId: 'ai-ml',
    worldThemeId: 'neural-nexus',
    worldName: 'Neural Nexus',
    worldDescription: 'A vast network where data flows become intelligence and models reshape every industry.',
    requirements: [
      'Python proficiency — pandas, numpy, scikit-learn, PyTorch or TensorFlow',
      'Statistics and probability foundations',
      'Strong coding fundamentals (DSA for big tech roles)',
      'GPU/compute access for hands-on model work',
    ],
    generalTracks: [
      { id: 'ai-engineer', name: 'AI Engineer', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '⚡ AI Core', tagline: 'Build AI products end to end', description: 'Broad AI engineering. Python, ML fundamentals, model deployment, cloud ML services. Most companies hire here first.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ml-engineer', name: 'Machine Learning Engineer', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '🔩 ML Foundry', tagline: 'Deploy models at production scale', description: 'ML pipelines, model deployment, Docker, cloud infrastructure. Bridge between research and product.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'mlops-engineer', name: 'MLOps Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🔄 Pipeline District', tagline: 'Keep models alive in production', description: 'CI/CD for ML, MLflow, Kubernetes, cloud ML platforms. You keep models healthy after they leave the notebook.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cv-engineer', name: 'Computer Vision Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '👁️ Vision Vault', tagline: 'Teach machines to see', description: 'PyTorch, CNNs, image segmentation, object detection. Autonomous vehicles, medical imaging, surveillance.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'nlp-engineer', name: 'NLP Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '💬 Language Lab', tagline: 'Build systems that understand language', description: 'Transformers, Hugging Face, RAG systems, LLM APIs. From sentiment analysis to production chatbots.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'llm-engineer', name: 'LLM Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🌌 LLM Observatory', tagline: 'Work at the frontier of AI capability', description: 'Fine-tuning, prompt engineering, RLHF, inference optimisation. Build production systems on foundation models.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ai-safety', name: 'AI Safety Researcher', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🔐 Safety Sanctum', tagline: 'Ensure AI goes well for humanity', description: 'Alignment research, interpretability, robustness. Based at Anthropic, DeepMind Safety, ARC, MIRI.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'genai-engineer', name: 'Generative AI Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '✨ Gen Studio', tagline: 'Build the tools everyone is using', description: 'Diffusion models, multimodal systems, image/video/audio generation. Fast-growing demand across industries.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'deep-learning-engineer', name: 'Deep Learning Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🧠 Deep Lab', tagline: 'Go deep on neural architectures', description: 'Neural network design, training at scale, custom architectures. Research labs and product AI teams.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'prompt-engineer', name: 'Prompt Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '✍️ Prompt Studio', tagline: 'Speak fluent AI', description: 'Prompt design, chain-of-thought, few-shot learning, evaluation. High demand at companies deploying LLMs.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 04. SOFTWARE ENGINEERING ─────────────────────────────────────────────
  {
    fieldId: 'software-engineering',
    worldThemeId: 'code-citadel',
    worldName: 'Code Citadel',
    worldDescription: 'A vast fortress where every tower is a different programming paradigm and all roads lead to production.',
    requirements: [
      'Data structures & algorithms (LeetCode for big tech)',
      'Proficiency in at least one language (Python, Java, TypeScript, Go, Rust)',
      'Git and collaborative development workflows',
      'System design fundamentals for mid/senior roles',
    ],
    generalTracks: [
      { id: 'software-engineer', name: 'Software Engineer', type: 'GENERAL', worldThemeId: 'code-citadel', worldLabel: '🏗️ Engineer Base', tagline: 'The broadest technical career on earth', description: 'DSA, system design, language fundamentals. FAANG path. LeetCode is the gate. Generalise first, specialise later.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'frontend-react', name: 'Frontend Engineer — React', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🎨 UI District', tagline: 'Build what users actually see', description: 'HTML/CSS, TypeScript, React, state management, API integration. 3+ polished portfolio apps required.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'backend-python', name: 'Backend Engineer — Python', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🐍 Python Peaks', tagline: 'The most in-demand backend stack', description: 'Python, FastAPI/Django, PostgreSQL, Redis, cloud deployment. Used at most startups and all large tech companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'backend-node', name: 'Backend Engineer — Node.js', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '⚙️ Server Side', tagline: 'Power the logic behind the screen', description: 'Node.js, Express/Fastify, SQL + MongoDB, REST/GraphQL APIs, auth systems.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'mobile-ios', name: 'Mobile Engineer — iOS', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '📱 Apple Archipelago', tagline: 'Build native apps for a billion devices', description: 'Swift, SwiftUI/UIKit, iOS architecture patterns, App Store deployment.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'mobile-android', name: 'Mobile Engineer — Android', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🤖 Droid Docks', tagline: "Build for the world's most used OS", description: 'Kotlin, Jetpack Compose, Android architecture, Google Play deployment.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'blockchain-dev', name: 'Blockchain Developer', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🔗 Solidity Spire', tagline: 'Write code that holds real value', description: 'Solidity (EVM), Rust (Solana), Hardhat/Foundry, ERC standards, DeFi protocol development.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'game-developer', name: 'Game Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🎮 Game Forge', tagline: 'Build worlds people live in', description: 'Unity/Unreal, C#/C++, game physics, rendering, multiplayer networking.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'qa-engineer', name: 'QA / Test Automation Engineer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🧪 Test Lab', tagline: 'Ship with confidence', description: 'Selenium, Cypress, Jest, CI/CD integration, performance testing. Quality is not optional.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 05. CLOUD & DEVOPS ───────────────────────────────────────────────────
  {
    fieldId: 'cloud-devops',
    worldThemeId: 'sky-forge',
    worldName: 'Sky Forge',
    worldDescription: 'High above the infrastructure layer — where services scale to billions and zero-downtime is the standard.',
    requirements: [
      'Linux fundamentals',
      'Scripting (Python/Bash)',
      'Networking basics (TCP/IP, DNS, load balancers)',
      'Cloud platform certifications (AWS/Azure/GCP SAA level)',
    ],
    generalTracks: [
      { id: 'devops-engineer', name: 'DevOps Engineer', type: 'GENERAL', worldThemeId: 'sky-forge', worldLabel: '🔄 Pipeline Plains', tagline: 'Ship software faster and safer', description: 'CI/CD pipelines, container orchestration, monitoring, incident response. Platform-agnostic.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'sre', name: 'Site Reliability Engineer (SRE)', type: 'GENERAL', worldThemeId: 'sky-forge', worldLabel: '🛡️ Reliability Ridge', tagline: 'Keep the lights on at scale', description: 'SLOs, error budgets, chaos engineering, incident management. Google-originated role.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'cloud-aws', name: 'Cloud Engineer — AWS', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🟠 AWS Archipelago', tagline: "Master the world's largest cloud", description: 'EC2, S3, Lambda, RDS, VPC, IAM. AWS Solutions Architect certification opens thousands of doors.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cloud-azure', name: 'Cloud Engineer — Azure', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🔵 Azure Atoll', tagline: 'Power enterprise Microsoft workloads', description: 'Azure VM, Blob, Functions, Active Directory, AKS. Dominant in enterprise. AZ-900 and AZ-104 certs.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cloud-gcp', name: 'Cloud Engineer — GCP', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🟢 Google Cloud', tagline: 'Built for data and AI workloads', description: 'BigQuery, GKE, Cloud Run, Vertex AI. Google Cloud Professional certs. Strong at data-intensive companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'k8s-engineer', name: 'Kubernetes Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '⛵ Container Cove', tagline: 'Orchestrate at scale', description: 'Kubernetes, Helm, service mesh, cluster management. CKA certification. High demand at microservices companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'terraform-engineer', name: 'Terraform / IaC Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🏗️ Infra Island', tagline: 'Code your entire infrastructure', description: 'Terraform, Pulumi, Ansible. Infrastructure as code is now the default at every serious tech company.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'finops-analyst', name: 'Cloud FinOps Analyst', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '💰 Cost Control', tagline: 'Make the cloud pay for itself', description: 'Cloud cost optimisation, tagging strategy, reserved instances, Spot usage. FinOps certification growing fast.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 06. CYBERSECURITY ────────────────────────────────────────────────────
  {
    fieldId: 'cybersecurity',
    worldThemeId: 'shadow-vault',
    worldName: 'Shadow Vault',
    worldDescription: 'High-stakes fortress of hidden corridors and attack surfaces — defenders and adversaries battle in silence.',
    requirements: [
      'Networking fundamentals (CompTIA Network+)',
      'One specialisation chosen early — offensive, defensive, or GRC',
      'Certifications matter: Security+, OSCP, CISM depending on path',
      'Home lab practice is expected and evaluated in interviews',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'soc-analyst', name: 'SOC Analyst (Tier 1)', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '📡 SOC Station', tagline: 'The first line of defence', description: 'SIEM tools (Splunk/Sentinel), log analysis, incident triage, network protocols. Security+ expected.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'pen-tester', name: 'Penetration Tester', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '⚔️ Red Zone', tagline: 'Think like an attacker', description: 'Kali Linux, OWASP Top 10, Burp Suite, Metasploit. OSCP is the industry standard. CTFs build mindset.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'security-engineer', name: 'Security Engineer', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🔐 Defense Layer', tagline: 'Build the systems that protect systems', description: 'Network security, IAM, endpoint protection, DevSecOps. Bridges engineering and security.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'grc-analyst', name: 'GRC Analyst', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '📋 Compliance Court', tagline: 'Govern risk at the organisational level', description: 'Risk frameworks (NIST, ISO 27001), compliance audits, policy writing.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'threat-intel', name: 'Threat Intelligence Analyst', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🕵️ Intel Bureau', tagline: 'Know your adversary before they strike', description: 'OSINT, threat actor profiling, malware analysis, intelligence production.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cloud-security', name: 'Cloud Security Engineer', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '☁️ Sky Shield', tagline: 'Secure infrastructure in the cloud era', description: 'Cloud-native security (AWS/Azure/GCP), IAM hardening, CSPM tools, zero trust architecture.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'appsec-engineer', name: 'Application Security Engineer', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🛡️ AppSec Citadel', tagline: 'Security baked in, not bolted on', description: 'SAST/DAST, secure SDLC, code review, supply chain security. Embeds with engineering teams.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'dfir-analyst', name: 'DFIR Specialist', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🔬 Forensics Lab', tagline: 'Reconstruct the attack after it happens', description: 'Digital forensics, incident response, malware analysis, reverse engineering. Post-breach investigation.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 07. DATA SCIENCE ─────────────────────────────────────────────────────
  {
    fieldId: 'data-science',
    worldThemeId: 'neural-nexus',
    worldName: 'Data Observatory',
    worldDescription: 'A high tower where analysts pull patterns invisible to everyone else from oceans of data.',
    requirements: [
      'Python — pandas, numpy, scikit-learn',
      'Statistics and probability',
      'SQL proficiency',
      'A/B testing and experimentation basics',
    ],
    generalTracks: [
      { id: 'data-scientist', name: 'Data Scientist', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '📈 Analytics Arena', tagline: 'Turn data into decisions', description: 'Python, statistics, ML fundamentals, SQL, A/B testing. Broad entry. Every industry hires this role.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'research-scientist', name: 'Research Scientist', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '🔬 Research Spire', tagline: 'Push the state of the art', description: 'Advanced statistics, research methodology, publication track record. PhD typically required at top labs.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'applied-scientist', name: 'Applied Scientist', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '⚗️ Applied Labs', tagline: 'Bridge research and production', description: 'ML engineering + research hybrid. Common at Amazon, Microsoft, Apple. Requires depth in a research area.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ml-scientist', name: 'Machine Learning Scientist', type: 'GENERAL', worldThemeId: 'neural-nexus', worldLabel: '🧬 ML Science', tagline: 'Design the algorithms behind the models', description: 'Novel algorithm design, model architecture research, paper-level contributions. Often PhD-track.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [],
  },

  // ── 08. DATA ANALYSIS & BI ───────────────────────────────────────────────
  {
    fieldId: 'data-analysis-bi',
    worldThemeId: 'default',
    worldName: 'Insight Arena',
    worldDescription: 'A colosseum where every metric tells a story and the analyst who tells it best shapes company decisions.',
    requirements: [
      'SQL — non-negotiable, must be fluent',
      'Excel/Google Sheets proficiency',
      'At least one BI tool (Tableau, Power BI, Looker)',
      'Domain knowledge matching the specific role',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'product-analyst', name: 'Product Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🚀 Product Tower', tagline: 'The analyst every product team needs', description: 'User behaviour, funnel metrics, retention cohorts, A/B test interpretation. SQL + Amplitude/Mixpanel.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'marketing-analyst', name: 'Marketing Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📣 Signal City', tagline: 'Measure what marketing actually does', description: 'Attribution modelling, campaign performance, CAC/LTV, channel analytics. SQL + Google Analytics.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'bi-developer-powerbi', name: 'BI Developer — Power BI', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📊 Dashboard District', tagline: 'Turn data into dashboards that drive action', description: 'Power BI, DAX, data modelling, report design. Dominant in enterprise and Microsoft-stack companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'bi-developer-tableau', name: 'BI Developer — Tableau', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🎨 Tableau Territory', tagline: 'Visualise data at enterprise scale', description: 'Tableau Desktop, Tableau Server, data source connections, performance optimisation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'financial-analyst', name: 'Financial Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '💹 Finance Floor', tagline: 'The numbers behind every business decision', description: 'FP&A, budgeting, variance analysis, financial modelling. Excel-heavy.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'supply-chain-analyst-sc', name: 'Supply Chain Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '🔗 Logistics Hub', tagline: 'Optimise how goods move through the world', description: 'Demand forecasting, inventory optimisation, supplier analytics, S&OP. SQL + ERP systems.', status: 'live', navigateTo: 'World' },
      { id: 'growth-analyst', name: 'Growth Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📈 Growth Lab', tagline: 'Find the lever that makes the number go up', description: 'Funnel analysis, experimentation, growth modelling, activation/retention metrics. Product + marketing crossover.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'fraud-analyst', name: 'Fraud Analyst', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🔍 Fraud Bureau', tagline: 'Find the bad actors in the data', description: 'Fraud detection models, transaction monitoring, rule engines, chargeback analysis. Fintech and banking.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 09. DATA ENGINEERING ─────────────────────────────────────────────────
  {
    fieldId: 'data-engineering',
    worldThemeId: 'sky-forge',
    worldName: 'Pipeline Foundry',
    worldDescription: 'A vast industrial complex where raw data is refined and delivered — fuelling every analyst and model downstream.',
    requirements: [
      'SQL (advanced — window functions, query optimisation)',
      'Python for ETL/ELT scripting',
      'At least one cloud data platform (Snowflake, BigQuery, Redshift)',
      'Understanding of data modelling concepts (star schema, Kimball)',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'data-engineer', name: 'Data Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🔩 Core Engineering', tagline: 'Build the data infrastructure everyone relies on', description: 'ETL/ELT pipelines, Python, SQL, cloud data warehouses. Specialism emerges from the company stack.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'analytics-engineer-dbt', name: 'Analytics Engineer — dbt', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🌿 Transform Zone', tagline: 'The role that bridged analytics and engineering', description: 'dbt, SQL, data modelling, testing, documentation. Fastest-growing data role of the past 3 years.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'streaming-engineer', name: 'Streaming Data Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🌊 Stream Station', tagline: 'Process data as it happens', description: 'Apache Kafka, Apache Flink, real-time pipeline design. Premium salary. Fintech, adtech, IoT platforms.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cloud-data-engineer', name: 'Cloud Data Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '☁️ Cloud Stack', tagline: 'Native cloud data infrastructure', description: 'AWS (Redshift/Glue/Athena), GCP (BigQuery/Dataflow), or Azure (Synapse/ADF).', status: 'coming_soon', navigateTo: 'World' },
      { id: 'data-warehouse-engineer', name: 'Data Warehouse Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🏛️ Warehouse District', tagline: 'The single source of truth', description: 'Snowflake, Redshift, BigQuery, Databricks. Dimensional modelling, performance tuning, query optimisation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'data-governance-engineer', name: 'Data Governance Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '📋 Data Council', tagline: 'Make data trustworthy at scale', description: 'Data cataloguing, lineage tracking, quality rules, access control. Collibra, Alation, dbt docs.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 10. SUPPLY CHAIN & OPERATIONS ────────────────────────────────────────
  {
    fieldId: 'supply-chain',
    worldThemeId: 'logistics-labyrinth',
    worldName: 'Logistics Labyrinth',
    worldDescription: 'A global network of factories, ports, warehouses, and last-mile routes — every optimisation saves millions.',
    requirements: [
      'Excel proficiency (pivot tables, VLOOKUP, scenario analysis)',
      'ERP system familiarity — SAP, Oracle, or equivalent',
      'SQL increasingly expected at data-forward companies',
      'Understanding of the specific supply chain sub-function you are targeting',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'supply-chain-analyst', name: 'Supply Chain Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '📊 Analyst Station', tagline: 'Translate data into supply chain decisions', description: 'Demand forecasting, inventory optimisation, supplier analytics, S&OP processes. The data backbone of any SC team.', status: 'live', navigateTo: 'World' },
      { id: 'demand-planner', name: 'Demand Planner', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '🔮 Forecast Tower', tagline: 'Predict the future of demand', description: 'Statistical forecasting, seasonality modelling, safety stock calculation. Kinaxis, Blue Yonder.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'procurement-analyst', name: 'Procurement Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '🛒 Sourcing Sanctum', tagline: 'Buy at the best price with the best suppliers', description: 'Supplier evaluation, RFQ management, contract analysis, cost reduction. Spend analytics.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'logistics-coordinator', name: 'Logistics Coordinator', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '🚚 Dispatch Depot', tagline: 'Move things from A to B — reliably', description: 'Freight booking, carrier management, customs documentation, tracking systems. TMS software.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'inventory-planner', name: 'Inventory Planner', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '📦 Inventory Isle', tagline: 'Never too much, never too little', description: 'Stock level optimisation, EOQ models, reorder point logic, ABC analysis. ERP + planning tools.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'sc-risk-analyst', name: 'Supply Chain Risk Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '⚠️ Risk Radar', tagline: 'Spot disruptions before they hit', description: 'Supplier risk scoring, geopolitical risk monitoring, ESG compliance, business continuity. Growing post-COVID.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'lean-analyst', name: 'Lean Six Sigma Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '⚙️ Process Lab', tagline: 'Eliminate waste, maximise flow', description: 'DMAIC methodology, waste elimination, process mapping, statistical process control. Green/Black Belt path.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 11. PRODUCT & DESIGN ─────────────────────────────────────────────────
  {
    fieldId: 'product-design',
    worldThemeId: 'design-district',
    worldName: 'Design District',
    worldDescription: 'A creative hub where interface, experience, and strategy converge — great products emerge from the intersection.',
    requirements: [
      'PM: analytical thinking, communication, product sense; no specific degree required',
      'UX: Figma proficiency, portfolio of 3+ case studies, user research basics',
      'UI: visual design principles, component libraries, design systems',
      'Both: understanding of the product development lifecycle',
    ],
    generalTracks: [
      { id: 'product-manager', name: 'Product Manager', type: 'GENERAL', worldThemeId: 'design-district', worldLabel: '🧭 Product Bridge', tagline: 'Own the product from vision to launch', description: 'Define strategy, work with engineering and design, prioritise roadmap. APM programs are the top entry path.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ux-designer', name: 'UX Designer', type: 'GENERAL', worldThemeId: 'design-district', worldLabel: '🌐 UX Universe', tagline: 'Design experiences, not just screens', description: 'User research, wireframing, prototyping, usability testing in Figma. Portfolio-first hiring.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'technical-pm', name: 'Technical Product Manager', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '⚙️ Tech PM Floor', tagline: 'Speak fluent engineer and fluent business', description: 'Technical requirements, API design decisions, architecture reviews. Engineering background a must.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'growth-pm', name: 'Growth Product Manager', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '📈 Growth Engine', tagline: 'Own the metrics that matter most', description: 'Acquisition, activation, retention, referral. Experiment-driven. Works closely with data and marketing.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ui-designer', name: 'UI Designer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🖼️ UI Gallery', tagline: 'Make it beautiful and usable', description: 'Visual design, component libraries, design systems, interaction patterns. Figma is the standard.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'product-designer', name: 'Product Designer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '⚗️ Design Lab', tagline: 'The full spectrum: research to pixel', description: 'End-to-end product design — research, wireframes, UI, and testing. Most common design hire at startups.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ux-researcher', name: 'UX Researcher', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🔍 Research Reef', tagline: 'The voice of the user inside the company', description: 'Qualitative and quantitative research, usability testing, survey design, synthesis. Stand-alone role at larger companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'motion-designer', name: 'Motion Designer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '✨ Motion Studio', tagline: 'Bring interfaces to life', description: 'After Effects, Principle, Lottie animations. UI micro-interactions, brand motion, video.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 12. DIGITAL MARKETING ────────────────────────────────────────────────
  {
    fieldId: 'digital-marketing',
    worldThemeId: 'default',
    worldName: 'Signal City',
    worldDescription: 'A sprawling metropolis of channels, audiences, and algorithms — the right message at the right time drives billions.',
    requirements: [
      'Google Analytics and Google Tag Manager fundamentals',
      'Specialisation in one channel (SEO, PPC, Paid Social, Email, Content)',
      'Platform certifications (Google Ads, Meta Blueprint, HubSpot)',
      'Data literacy — able to read attribution reports and make budget decisions',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'seo-specialist', name: 'SEO Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🔎 Search Summit', tagline: 'Win the search engines for free', description: 'On-page optimisation, technical SEO, link building, keyword research. Ahrefs, SEMrush, GSC.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ppc-specialist', name: 'PPC Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '💰 Paid Peaks', tagline: 'Spend money to make more money', description: 'Google Ads, Microsoft Ads, campaign structure, bidding strategies, conversion tracking.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'paid-social', name: 'Paid Social Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📱 Social Sphere', tagline: 'Turn scrolling into sales', description: 'Meta, TikTok, LinkedIn ad campaigns. Audience targeting, creative testing, ROAS optimisation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'email-marketing', name: 'Email Marketing Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📧 Inbox Island', tagline: 'The highest-ROI channel in marketing', description: 'Email flows, segmentation, A/B testing, deliverability. HubSpot, Klaviyo, Mailchimp.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'content-strategist', name: 'Content Strategist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '✍️ Content Castle', tagline: 'Build audiences through ideas', description: 'Content calendar, editorial strategy, SEO content, brand voice. Strong at B2B SaaS.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'growth-marketer', name: 'Growth Marketer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🚀 Growth Lab', tagline: 'Experiment your way to scale', description: 'Acquisition experiments, CRO, referral programmes, product-led growth. Full funnel ownership.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 13. FINTECH & BLOCKCHAIN ─────────────────────────────────────────────
  {
    fieldId: 'fintech-blockchain',
    worldThemeId: 'blockchain-borough',
    worldName: 'Fintech Exchange',
    worldDescription: 'A digital financial hub where traditional money rails and blockchain infrastructure intersect.',
    requirements: [
      'Smart contract development: Solidity (EVM) or Rust (Solana)',
      'Security mindset — understanding common exploits (reentrancy, overflow)',
      'Financial market fundamentals for analysis/strategy roles',
      'Strong blockchain/DeFi protocol knowledge for all roles',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'blockchain-dev-solidity', name: 'Blockchain Developer — Solidity', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🔷 EVM Empire', tagline: "Build on the world's largest smart contract platform", description: 'Solidity, Hardhat/Foundry, OpenZeppelin, DeFi protocol patterns. Ethereum, Arbitrum, Base.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'blockchain-dev-rust', name: 'Blockchain Developer — Rust/Solana', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🟣 Solana Shores', tagline: 'Build at the speed of Solana', description: 'Rust, Anchor framework, Solana program model, SPL tokens. High complexity, higher compensation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'smart-contract-auditor-ft', name: 'Smart Contract Auditor', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🔍 Audit Archipelago', tagline: 'Find bugs worth millions', description: 'Manual code review, automated tools (Slither, Echidna), exploit writing, report writing.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'zk-engineer', name: 'Zero-Knowledge Engineer', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🌀 ZK Frontier', tagline: 'Build privacy-preserving systems', description: 'ZK circuit design (Circom, Halo2), proof systems (PLONK, STARKs). Most mathematically demanding role in Web3.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'defi-protocol-dev', name: 'DeFi Protocol Developer', type: 'SPECIFIC', worldThemeId: 'blockchain-borough', worldLabel: '🌊 DeFi Depths', tagline: 'Build the protocols that hold billions', description: 'AMM design, lending protocol mechanics, yield optimisation, flash loan architecture.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'web3-frontend', name: 'Web3 Frontend Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🖥️ Web3 UI', tagline: 'The interface between users and blockchains', description: 'React/Next.js, ethers.js/viem, wallet connectors, on-chain data display. UX that makes crypto approachable.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 14. RENEWABLE ENERGY & ESG ───────────────────────────────────────────
  {
    fieldId: 'renewable-energy',
    worldThemeId: 'green-frontier',
    worldName: 'Green Frontier',
    worldDescription: 'Industries building the infrastructure of a sustainable future — engineering, finance, and climate science converge.',
    requirements: [
      'Engineering: relevant engineering degree (electrical, mechanical, chemical)',
      'ESG: finance/economics/science background + ESG data tools',
      'Climate risk: financial modelling + climate scenario analysis (TCFD framework)',
      'All paths benefit from sustainability certifications (GRI, SASB, CFA ESG)',
    ],
    generalTracks: [
      { id: 'renewable-engineer', name: 'Renewable Energy Engineer', type: 'GENERAL', worldThemeId: 'green-frontier', worldLabel: '⚡ Energy Campus', tagline: 'Engineer the clean energy transition', description: 'Broad engineering hire across solar, wind, hydro, storage. Often placed on a project type after onboarding.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'energy-systems-engineer', name: 'Energy Systems Engineer', type: 'GENERAL', worldThemeId: 'green-frontier', worldLabel: '🔋 Systems Grid', tagline: 'Design the interconnected energy future', description: 'System integration, grid stability, energy storage, hybrid renewable systems. Broad hire, specialise on the job.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'solar-engineer', name: 'Solar Energy Engineer', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '☀️ Solar Station', tagline: 'Design and deploy solar at scale', description: 'PV system design, energy modelling (PVsyst), grid interconnection. Utility-scale and C&I markets.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'wind-engineer', name: 'Wind Energy Engineer', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '💨 Wind Ridge', tagline: 'Harness the power of moving air', description: 'Turbine design, wind resource assessment, offshore installation, wake modelling.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'esg-analyst', name: 'ESG Analyst', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '🌍 ESG Observatory', tagline: 'Measure and report corporate sustainability', description: 'ESG data collection, GRI/SASB/TCFD frameworks, materiality assessments, sustainability disclosures.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'carbon-accounting', name: 'Carbon Accounting Specialist', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '🌡️ Carbon Vault', tagline: 'Quantify the cost of emissions', description: 'GHG inventory (Scope 1/2/3), carbon footprint analysis, offset verification, net-zero target setting.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'climate-risk', name: 'Climate Risk Analyst', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '🌪️ Risk Horizon', tagline: 'Model the financial cost of climate change', description: 'Physical and transition risk modelling, TCFD scenario analysis, portfolio climate stress testing.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 15. PROJECT & PROGRAM MANAGEMENT ─────────────────────────────────────
  {
    fieldId: 'project-management',
    worldThemeId: 'default',
    worldName: 'Command Bridge',
    worldDescription: 'The command centre where strategy becomes execution — on time, on budget, without losing anyone.',
    requirements: [
      'Organised, process-oriented mindset',
      'Stakeholder management and communication skills',
      'Certifications open doors: PMP, PMI-ACP, PRINCE2, Scrum/SAFe',
      'Domain experience accelerates progression in specific PM roles',
    ],
    generalTracks: [
      { id: 'project-manager', name: 'Project Manager', type: 'GENERAL', worldThemeId: 'default', worldLabel: '🗓️ Project Central', tagline: 'Deliver anything, anywhere', description: 'Scope management, scheduling, risk tracking, stakeholder communication. PMP is the international standard.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'program-manager', name: 'Program Manager', type: 'GENERAL', worldThemeId: 'default', worldLabel: '🌐 Program Hub', tagline: 'Coordinate the portfolio of projects', description: 'Portfolio management, interdependency mapping, executive stakeholder management, budget governance.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'pmo-analyst', name: 'PMO Analyst', type: 'GENERAL', worldThemeId: 'default', worldLabel: '📋 PMO Hub', tagline: 'Standardise how the organisation delivers', description: 'Governance frameworks, reporting, resource allocation, methodology design. Entry path at large corporates.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'scrum-master', name: 'Scrum Master', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🔄 Agile Arena', tagline: 'Remove blockers, accelerate teams', description: 'Agile ceremonies, team facilitation, impediment removal, metrics. CSM or PSM certification standard.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'technical-pm', name: 'Technical Project Manager', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '⚙️ Tech Bridge', tagline: 'Bridge engineering and business', description: 'Software delivery, architecture reviews, technical risk management, vendor coordination.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'business-analyst', name: 'Business Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📊 Analysis Alley', tagline: 'Translate business needs into solutions', description: 'Requirements gathering, process mapping, stakeholder interviews, gap analysis, UAT.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 16. HEALTHCARE (NON-CLINICAL) ────────────────────────────────────────
  {
    fieldId: 'healthcare-nonclinical',
    worldThemeId: 'default',
    worldName: 'Health Citadel',
    worldDescription: 'The infrastructure of medicine — data, regulation, and operations converge to support those saving lives.',
    requirements: [
      'Role-specific: biology/pharmacy degree for medical writing/PV; IT background for informatics',
      'Understanding of healthcare regulatory framework (FDA, EMA, ICH guidelines)',
      'SQL and data tools for informatics and analytics roles',
      'Strong writing skills for medical writing and regulatory affairs',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'health-informatics', name: 'Health Informatics Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '💊 Informatics Isle', tagline: 'Make healthcare data usable', description: 'EHR systems (Epic, Cerner), HL7/FHIR, clinical data analysis. Bridge between clinical ops and data teams.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'clinical-data-analyst', name: 'Clinical Data Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🧬 Clinical Lab', tagline: 'Turn trial data into evidence', description: 'Clinical data management, CDMS tools, data cleaning, SAE reconciliation. Pharma and CRO roles.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'medical-writer', name: 'Medical Writer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📄 Document Dock', tagline: 'Communicate science with precision', description: 'Clinical study reports, regulatory submissions (NDA/MAA), journal publications. Life sciences degree + writing.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'regulatory-affairs', name: 'Regulatory Affairs Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📜 Reg Reform', tagline: 'Navigate the path from lab to market', description: 'FDA/EMA submissions, eCTD formatting, regulatory strategy. RAC certification adds credibility.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'pharmacovigilance', name: 'Pharmacovigilance Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '⚕️ Safety Sentinel', tagline: 'Monitor drug safety post-approval', description: 'Adverse event reporting, signal detection, PSUR writing, ICH E2 guidelines.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 17. LEGAL & COMPLIANCE ───────────────────────────────────────────────
  {
    fieldId: 'legal-compliance',
    worldThemeId: 'default',
    worldName: 'Justice Tower',
    worldDescription: 'A fortress of rules, frameworks, and risk — every decision has legal weight and the wrong move costs millions.',
    requirements: [
      'Specific regulation knowledge for the relevant domain (AML, GDPR, trade)',
      'Professional certifications: CAMS (AML), CIPP (Privacy), ACAMS (crypto compliance)',
      'Strong analytical and writing skills',
      'Attention to detail — compliance errors have legal consequences',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'aml-analyst', name: 'AML Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🔍 AML Outpost', tagline: 'Follow the dirty money', description: 'Transaction monitoring, SARs, customer due diligence. CAMS certification standard. Banks and crypto.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'kyc-analyst', name: 'KYC Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🪪 Identity Island', tagline: 'Know every customer before they enter', description: 'Customer identification, beneficial ownership, enhanced due diligence. Fintechs and crypto exchanges.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'data-privacy', name: 'Data Privacy Analyst', type: 'SPECIFIC', worldThemeId: 'shadow-vault', worldLabel: '🔒 Privacy Peninsula', tagline: "Protect people's data at scale", description: 'GDPR, CCPA, data mapping, DPIA assessments, breach response. CIPP certification. Growing globally.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'grc-legal', name: 'GRC Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📋 Governance Grounds', tagline: 'Manage risk across the enterprise', description: 'Risk frameworks (NIST, ISO 31000), internal controls, compliance audits, policy development.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'sanctions-analyst', name: 'Sanctions Compliance Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🌐 Sanctions Bureau', tagline: "Navigate the world's regulatory boundaries", description: 'OFAC/UN/EU sanctions screening, denied party lists, sanctions risk assessments. Banks and multinationals.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 18. HUMAN RESOURCES ──────────────────────────────────────────────────
  {
    fieldId: 'human-resources',
    worldThemeId: 'default',
    worldName: 'People Plaza',
    worldDescription: 'The living heart of every organisation — where talent is found, grown, and retained.',
    requirements: [
      'Strong communication and interpersonal skills',
      'Understanding of employment law basics in your jurisdiction',
      'HRIS system familiarity (Workday, BambooHR, etc.)',
      'For specialist tracks: PHR, SHRM-CP, or AIRS certification',
    ],
    generalTracks: [
      { id: 'hr-generalist', name: 'HR Generalist', type: 'GENERAL', worldThemeId: 'default', worldLabel: '🏘️ HR Village', tagline: 'The foundation of every people function', description: 'Employee relations, onboarding, policy administration, HRIS management. Entry path at small/mid-size companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'hr-coordinator', name: 'HR Coordinator', type: 'GENERAL', worldThemeId: 'default', worldLabel: '📋 Admin Annex', tagline: 'Keep the people operations running', description: 'Day-to-day HR operations — scheduling, documentation, compliance tracking. Entry-level at large companies.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'technical-recruiter', name: 'Technical Recruiter', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🎯 Talent Terrace', tagline: 'Find the engineers everyone is hunting', description: 'Sourcing, screening, technical intake calls, offer negotiation. Understanding of engineering roles essential.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'comp-analyst', name: 'Compensation Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '💲 Reward Ridge', tagline: 'Design pay structures that attract and retain talent', description: 'Job architecture, salary benchmarking, equity design, bonus plan modelling. Radford, Mercer, Levels.fyi data.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'people-analytics', name: 'People Analytics Specialist', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '📊 People Lab', tagline: 'Turn workforce data into leadership decisions', description: 'Attrition modelling, engagement analytics, workforce planning. SQL + Python + Tableau/Power BI.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ld-specialist', name: 'L&D Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📚 Learning Hub', tagline: 'Develop the people who develop businesses', description: 'Learning needs analysis, programme design, facilitation, learning measurement. Corporate L&D teams.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 19. SALES & REVENUE ──────────────────────────────────────────────────
  {
    fieldId: 'sales-revenue',
    worldThemeId: 'default',
    worldName: 'Revenue Ridge',
    worldDescription: 'A high-energy commercial arena where conversations become contracts — and top performers earn more than most engineers.',
    requirements: [
      'Strong verbal communication and active listening',
      'CRM fluency (Salesforce, HubSpot)',
      'Resilience — rejection is daily; persistence is the core competency',
      'Domain knowledge of the industry you are selling into',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'sdr', name: 'Sales Development Rep (SDR)', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📞 Outbound Outpost', tagline: 'The prospecting engine of every sales org', description: 'Cold outreach, discovery calls, CRM hygiene, pipeline building. Classic first step into B2B tech sales.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'account-executive', name: 'Account Executive — SMB', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🤝 Closing Circle', tagline: 'Take deals from demo to signed', description: 'Full sales cycle, demos, objection handling, proposal writing, negotiation. High OTE upside.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'csm', name: 'Customer Success Manager', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🌱 Success Garden', tagline: 'Turn customers into lifetime revenue', description: 'Onboarding, adoption, QBRs, expansion conversations, churn prevention. Post-sales revenue engine.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'sales-engineer', name: 'Sales Engineer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🔧 Technical Sales', tagline: 'Speak fluent engineer and fluent business', description: 'Technical demos, POC management, integration architecture. Highest base salary in sales.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'revops', name: 'RevOps Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '⚙️ Revenue Engine', tagline: 'Optimise the entire revenue machine', description: 'CRM administration, sales process design, reporting, territory planning. Salesforce + SQL.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 20. WRITING & CONTENT ────────────────────────────────────────────────
  {
    fieldId: 'writing-content',
    worldThemeId: 'default',
    worldName: 'Story Spire',
    worldDescription: 'A towering library of words — technical precision and creative storytelling converge to move audiences.',
    requirements: [
      'Portfolio of published writing (3–5 strong samples minimum)',
      'Domain knowledge for technical/medical/legal writing',
      'SEO fundamentals for digital content roles',
      'Strong editing and research skills',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'technical-writer', name: 'Technical Writer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '📖 Doc District', tagline: 'Make complexity readable', description: 'API documentation, product guides, developer docs, knowledge bases. High demand at software companies.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'ux-writer', name: 'UX Writer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '💬 Copy Cove', tagline: 'The voice inside the product', description: 'Microcopy, error messages, onboarding flows, content patterns. Works inside design teams.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'copywriter', name: 'Copywriter', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🎪 Ad Arena', tagline: 'Words that sell', description: 'Ad copy, landing pages, email sequences, brand voice. Freelance market very active.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'medical-writer-content', name: 'Medical Writer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🏥 Med Doc Studio', tagline: 'Communicate science for patients and regulators', description: 'Clinical study reports, patient-facing content, regulatory submissions. Life sciences background required.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'grant-writer', name: 'Grant Writer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '✍️ Funding Fort', tagline: 'Win the funding that keeps missions alive', description: 'Grant proposals, donor research, budget narratives, reporting. NGOs, universities, social enterprises.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 21. CREATIVE & MEDIA ─────────────────────────────────────────────────
  {
    fieldId: 'creative-media',
    worldThemeId: 'design-district',
    worldName: 'Studio District',
    worldDescription: 'A vibrant creative complex where video, animation, audio, and design production converge to shape culture.',
    requirements: [
      'Portfolio is the entire interview — no portfolio, no job',
      'Software proficiency: role-specific (Premiere, After Effects, Cinema 4D, Pro Tools)',
      'Understanding of production workflows and collaboration tools',
      'Personal brand / channel helps enormously for content-facing roles',
    ],
    generalTracks: [
      { id: 'game-designer', name: 'Game Designer', type: 'GENERAL', worldThemeId: 'design-district', worldLabel: '🕹️ Game Grounds', tagline: 'Create worlds people spend their lives in', description: 'Game mechanics, level design, player psychology, systems design. Studios hire broadly for design thinking.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'narrative-designer', name: 'Narrative Designer', type: 'GENERAL', worldThemeId: 'design-district', worldLabel: '📖 Story Lab', tagline: 'Make worlds feel real through words', description: 'Branching dialogue, world-building, character arcs, lore documentation. Games and interactive media.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'video-editor', name: 'Video Editor', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🎞️ Edit Suite', tagline: 'The story is in the cut', description: 'Premiere Pro, DaVinci Resolve, short-form and long-form editing, colour grading basics.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'animator-3d', name: '3D Animator', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '✨ Animation Alley', tagline: 'Make the impossible move', description: 'Maya, Blender, animation principles, rigging, rendering. Games, film, advertising, product visualisation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'motion-graphics', name: 'Motion Graphics Designer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🌀 Motion Lab', tagline: 'Make information move', description: 'After Effects, Cinema 4D, explainer video, broadcast graphics, kinetic typography.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'sound-designer', name: 'Sound Designer', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🎵 Audio Atoll', tagline: 'Create the sounds of imaginary worlds', description: 'Pro Tools, sound synthesis, Foley recording, audio implementation (Wwise/FMOD for games).', status: 'coming_soon', navigateTo: 'World' },
      { id: 'game-developer-media', name: 'Game Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '🎮 Dev Studio', tagline: 'Build the game, not just design it', description: 'Unity/Unreal, C#/C++, game physics, rendering pipeline, multiplayer. Production-facing role.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 22. SPECIALIZED ENGINEERING ──────────────────────────────────────────
  {
    fieldId: 'specialized-engineering',
    worldThemeId: 'default',
    worldName: "Engineer's Forge",
    worldDescription: "The physical world's design studio — physics, materials, and mathematics translated into buildings, circuits, and machines.",
    requirements: [
      'Relevant engineering degree (4-year minimum, PE licence for some roles)',
      'CAD/simulation software for the discipline (SolidWorks, ANSYS, AutoCAD, MATLAB)',
      'Internship experience is strongly expected by first hire',
      'Professional licensure (PE, PEng, CEng) opens senior roles',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'mechanical-engineer', name: 'Mechanical Engineer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '⚙️ Mechanical Mesa', tagline: 'Design the machines that move the world', description: 'Product design, thermal analysis, FEA (ANSYS), SolidWorks/CATIA. Manufacturing, aerospace, automotive.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'electrical-engineer', name: 'Electrical Engineer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '⚡ Electrical Empire', tagline: 'Power everything that needs power', description: 'Circuit design, power systems, embedded systems, MATLAB/Simulink, PCB design (Altium).', status: 'coming_soon', navigateTo: 'World' },
      { id: 'civil-engineer', name: 'Civil Engineer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🌉 Civil Citadel', tagline: 'Build the infrastructure of civilisation', description: 'Structural analysis, geotechnical engineering, transportation, AutoCAD Civil 3D. PE licence essential.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'robotics-engineer', name: 'Robotics Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🤖 Robotics Reserve', tagline: 'Give machines the ability to act', description: 'ROS, control systems, motion planning, sensor integration. Bridges mechanical, electrical, and software.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'aerospace-engineer', name: 'Aerospace Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🚀 Aerospace Apex', tagline: 'Build what flies highest', description: 'Aerodynamics, propulsion, avionics, structural analysis. Defence, commercial aviation, NewSpace.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'chemical-engineer', name: 'Chemical Engineer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🧪 Process Plant', tagline: 'Design the processes that make everything', description: 'Process design, heat transfer, reactor design, process safety. Pharma, oil & gas, materials.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 23. REAL ESTATE & CONSTRUCTION ───────────────────────────────────────
  {
    fieldId: 'real-estate',
    worldThemeId: 'default',
    worldName: 'Blueprint Bay',
    worldDescription: 'Where capital meets concrete — every decision involves millions of dollars, years of development, and physical permanence.',
    requirements: [
      'Finance roles: financial modelling (Excel/Argus), real estate fundamentals',
      'Construction: engineering degree or construction management, PMP or LEED',
      'Property management: facilities management experience, Yardi/MRI proficiency',
      'All roles benefit from local market knowledge',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 're-analyst', name: 'Real Estate Financial Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📐 Finance Floor', tagline: 'Model the numbers behind the buildings', description: 'DCF modelling, acquisition underwriting, Argus Enterprise, market analysis. Excel financial modelling focus.', status: 'coming_soon', navigateTo: 'World' },
      { id: 're-investment-analyst', name: 'Real Estate Investment Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '💼 Investment Isle', tagline: 'Allocate capital into physical assets', description: 'Deal underwriting, market research, portfolio strategy, investor reporting. Private equity real estate.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'construction-pm', name: 'Construction Project Manager', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🏗️ Build Zone', tagline: 'Deliver the project on time and on budget', description: 'Schedule management (Primavera P6), cost control, contractor management, site safety.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'urban-planner', name: 'Urban Planner', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🏙️ City Lab', tagline: 'Shape how cities grow', description: 'Land use planning, zoning, environmental review, community engagement, planning software (ArcGIS).', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 24. EDUCATION TECHNOLOGY ─────────────────────────────────────────────
  {
    fieldId: 'education-technology',
    worldThemeId: 'default',
    worldName: 'Learning Labyrinth',
    worldDescription: 'A vast campus where curriculum design, technology, and pedagogy converge to shape how people learn.',
    requirements: [
      "Instructional design: understanding of learning theory (ADDIE, SAM, Bloom's taxonomy)",
      'eLearning development: Articulate 360, Adobe Captivate, LMS administration',
      'Corporate training: facilitation skills, curriculum development',
      'Portfolio of learning experiences built',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'instructional-designer', name: 'Instructional Designer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🎓 Design Academy', tagline: 'Engineer learning that actually works', description: 'Learning analysis, course design, storyboarding, ADDIE/SAM models. Portfolio of 3+ experiences essential.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'elearning-developer', name: 'eLearning Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '💻 Digital Dojo', tagline: 'Build interactive courses at scale', description: 'Articulate Storyline/Rise, Adobe Captivate, HTML5 interactives, SCORM/xAPI, LMS deployment.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'corporate-trainer', name: 'Corporate Trainer', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🎤 Training Theatre', tagline: 'Develop people who develop businesses', description: 'Facilitation, workshop design, coaching, needs analysis, learning measurement.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'edtech-pm', name: 'EdTech Product Manager', type: 'SPECIFIC', worldThemeId: 'design-district', worldLabel: '🏫 EdTech Bridge', tagline: 'Build products that teach the world', description: 'Curriculum-product alignment, learner analytics, LMS strategy, engagement mechanics.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 25. LOGISTICS & TRADE ────────────────────────────────────────────────
  {
    fieldId: 'logistics-trade',
    worldThemeId: 'logistics-labyrinth',
    worldName: 'Trade Port',
    worldDescription: 'The global flow of goods — containers, customs clearances, and carrier relationships underpin every economy.',
    requirements: [
      'Incoterms knowledge (for freight and customs roles)',
      'Customs broker licence (US: required by law for independent practice)',
      'TMS software familiarity (Oracle TMS, SAP TM, MercuryGate)',
      'Understanding of import/export documentation (BL, AWB, commercial invoice)',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'freight-forwarder', name: 'Freight Forwarder', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '✈️ Freight Floor', tagline: 'Move cargo across borders, every day', description: 'Ocean/air freight coordination, booking, documentation, carrier relationships. DHL, Kuehne+Nagel, Expeditors.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'customs-broker', name: 'Customs Broker', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '🛃 Clearance Cove', tagline: "Navigate the world's border regulations", description: 'US CBP licence (required), tariff classification (HTS codes), duty determination, import/export compliance.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'trade-compliance', name: 'Trade Compliance Specialist', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '⚖️ Compliance Quay', tagline: 'Keep global shipments legal and on time', description: 'Export controls (EAR/ITAR), sanctions screening (OFAC), denied party screening. Growing with sanctions complexity.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'logistics-tech-analyst', name: 'Logistics Technology Analyst', type: 'SPECIFIC', worldThemeId: 'logistics-labyrinth', worldLabel: '💻 TMS Control', tagline: 'Make logistics run on data', description: 'TMS implementation, carrier API integrations, logistics analytics dashboards, automation workflows.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 26. INSURANCE & ACTUARIAL ────────────────────────────────────────────
  {
    fieldId: 'insurance-actuarial',
    worldThemeId: 'quant-quarter',
    worldName: 'Risk Haven',
    worldDescription: 'A fortress of probability tables and pricing models — mathematical art of risk management meets human protection.',
    requirements: [
      'Actuarial: strong mathematics, begin CAS or SOA exam series (P, FM exams first)',
      'Underwriting: commercial awareness, analytical skills, specific line of business knowledge',
      'Claims: negotiation and investigation skills, legal awareness',
      'Excel proficiency is universal; R/Python for actuarial',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'actuarial-analyst-ins', name: 'Actuarial Analyst', type: 'SPECIFIC', worldThemeId: 'quant-quarter', worldLabel: '📐 Actuarial Archive', tagline: 'Model risk for a living', description: 'Begin exam series (P, FM), pricing models, reserving, loss development. Salary increases with each exam passed.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'underwriter', name: 'Underwriter', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📋 Underwriting Unit', tagline: 'Price risk and decide who gets covered', description: 'Risk assessment, policy pricing, coverage negotiation, loss ratio management. Line of business specific.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cat-modeler', name: 'Catastrophe Risk Modeler', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '🌪️ CAT Zone', tagline: 'Model the financial cost of disasters', description: 'RMS, AIR Worldwide, catastrophe models (earthquake, hurricane, flood). Reinsurance-heavy. Rare skill.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'claims-analyst', name: 'Claims Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📁 Claims Court', tagline: 'Assess and settle fairly', description: 'Claim investigation, coverage analysis, settlement negotiation, fraud detection. All lines of business.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 27. PUBLIC SECTOR & NGO ──────────────────────────────────────────────
  {
    fieldId: 'public-sector-ngo',
    worldThemeId: 'green-frontier',
    worldName: 'Civic Grounds',
    worldDescription: 'Where policy, funding, and mission converge — the architecture of public good and civic change.',
    requirements: [
      'Strong academic background (relevant undergraduate + often graduate degree)',
      'International experience for development roles',
      'Language skills valued (French, Spanish, Arabic, Swahili for international orgs)',
      'Grant writing for NGO and academic roles',
    ],
    generalTracks: [
      { id: 'dev-consultant', name: 'International Development Consultant', type: 'GENERAL', worldThemeId: 'green-frontier', worldLabel: '🌐 Global Gateway', tagline: 'Advise governments on development strategy', description: 'Broad hire at consulting firms (Deloitte, DAI, Chemonics). Project management, MEL, stakeholder engagement.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'public-sector-consultant', name: 'Public Sector Management Consultant', type: 'GENERAL', worldThemeId: 'green-frontier', worldLabel: '🏛️ Government Gate', tagline: 'Reform the institutions that shape daily life', description: 'Policy implementation, organisational change, digital transformation for government. Management consulting firms.', status: 'coming_soon', navigateTo: 'World' },
    ],
    specificTracks: [
      { id: 'policy-analyst', name: 'Policy Analyst', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📜 Policy Precinct', tagline: 'Turn evidence into government decisions', description: 'Research, stakeholder consultation, policy brief writing, regulatory impact assessment. Graduate degree typically required.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'mel-specialist', name: 'M&E Specialist', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '📊 Evidence Atoll', tagline: 'Prove the programme is working', description: 'Monitoring and evaluation frameworks, logframes, indicator tracking, data analysis, programme reporting.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'grant-manager', name: 'Grant Manager', type: 'SPECIFIC', worldThemeId: 'default', worldLabel: '✍️ Funding Fort', tagline: 'Win and manage the funding that keeps missions alive', description: 'Grant proposal writing, donor landscape research, budget narratives, financial reporting.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 28. AGRICULTURE TECHNOLOGY ───────────────────────────────────────────
  {
    fieldId: 'agriculture-tech',
    worldThemeId: 'green-frontier',
    worldName: 'Harvest Hub',
    worldDescription: 'The tech frontier of feeding the world — drones, IoT sensors, satellite imagery, and data analytics meet soil and seed.',
    requirements: [
      'Domain background in agriculture, environmental science, or agronomy',
      'Python/R for data and analytics roles',
      'GIS tools (QGIS, ArcGIS) for precision agriculture',
      'IoT and sensor data experience increasingly expected',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'precision-ag', name: 'Precision Agriculture Specialist', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '🛸 Precision Field', tagline: 'Optimise every hectare with data', description: 'Remote sensing, NDVI analysis, variable rate application, GPS guidance systems.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'agri-data', name: 'Agri-Data Analyst', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '📊 Data Farm', tagline: 'Turn crop and soil data into decisions', description: 'Agricultural datasets (weather, soil, yield), Python/R, geospatial analysis, supply chain analytics.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'agritech-dev', name: 'AgriTech Software Developer', type: 'SPECIFIC', worldThemeId: 'code-citadel', worldLabel: '💻 Farm Code', tagline: 'Build the apps that feed the world', description: 'IoT systems, farm management software, sensor integrations, data pipelines for agricultural operations.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'food-safety', name: 'Food Safety Analyst', type: 'SPECIFIC', worldThemeId: 'green-frontier', worldLabel: '🔬 Safety Silo', tagline: 'Protect the food supply chain', description: 'HACCP, food quality systems (ISO 22000, SQF), regulatory compliance (FDA, USDA), supplier audits.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },

  // ── 29. COMPUTATIONAL SCIENCE ────────────────────────────────────────────
  {
    fieldId: 'computational-science',
    worldThemeId: 'neural-nexus',
    worldName: 'Simulation Station',
    worldDescription: 'A labyrinth of equations, high-performance clusters, and scientific code — laws of physics solved numerically.',
    requirements: [
      'Domain degree: biology, chemistry, physics, or engineering (MSc/PhD increasingly expected)',
      'Scientific Python (NumPy, SciPy, BioPython, MDAnalysis)',
      'HPC experience: SLURM, MPI, job scheduling for large-scale roles',
      'Publication record helps for research-track roles',
    ],
    generalTracks: [],
    specificTracks: [
      { id: 'comp-biologist', name: 'Computational Biologist', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🧬 Genomics Grid', tagline: 'Decode life with code', description: 'Python/R, NGS analysis, variant calling, pathway analysis, genomics tools (GATK, STAR, DESeq2). Pharma, biotech.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'bioinformatics', name: 'Bioinformatics Scientist', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🔬 Bio Lab', tagline: 'Analyse biological data at scale', description: 'Sequence alignment, structural bioinformatics, drug target identification, pipeline development.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'comp-physicist', name: 'Computational Physicist', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '⚛️ Physics Peninsula', tagline: 'Simulate the physical universe', description: 'Python/C++, Monte Carlo methods, molecular dynamics, quantum chemistry. National labs, universities.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'comp-chemist', name: 'Computational Chemist', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🧪 Chem Sim', tagline: 'Model molecules before they exist', description: 'Python, quantum chemistry software (Gaussian/ORCA), DFT basics, drug discovery pipelines.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'cfd-engineer', name: 'CFD Engineer', type: 'SPECIFIC', worldThemeId: 'sky-forge', worldLabel: '🌊 Fluid Forge', tagline: 'Simulate fluids with mathematics', description: 'ANSYS Fluent, OpenFOAM, mesh generation, turbulence modelling. Aerospace, automotive, energy.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'hpc-engineer', name: 'HPC Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🖥️ Supercompute', tagline: 'Run science at machine speed', description: 'Parallel computing, MPI/OpenMP, SLURM, GPU programming (CUDA), cluster optimisation.', status: 'coming_soon', navigateTo: 'World' },
      { id: 'digital-twin-engineer', name: 'Digital Twin Engineer', type: 'SPECIFIC', worldThemeId: 'neural-nexus', worldLabel: '🔄 Twin Lab', tagline: 'Mirror the physical world in software', description: 'Simulation modelling, real-time data integration, IoT sensor feeds, predictive analytics. Manufacturing and infrastructure.', status: 'coming_soon', navigateTo: 'World' },
    ],
  },


  // ── 30. STARKNET ECOSYSTEM ──────────────────────────────────────────────────
  {
    fieldId: 'starknet',
    worldThemeId: 'starknet-realm',
    worldName: 'Starknet Realm',
    worldDescription: 'ZK-powered Layer 2 where account abstraction, gasless wallets, and Cairo smart contracts redefine what a blockchain can do.',
    requirements: [
      'Comfort with wallets and basic DeFi concepts (Starknet Islands completion recommended)',
      'Willingness to execute real transactions on Starknet Sepolia during lessons',
      'StarkZap SDK familiarity — installed or running in demo mode',
      'Appetite for building on an early ecosystem with ground-floor opportunity',
    ],
    generalTracks: [],
    specificTracks: [
      {
        id: 'starknet-islands',
        name: 'Starknet Islands',
        type: 'SPECIFIC',
        worldThemeId: 'starknet-realm',
        worldLabel: '⚡ Starknet Islands',
        tagline: 'Learn Starknet by doing — real Sepolia transactions as you level up',
        description: 'Account abstraction, gasless wallets, STRK swaps, staking, lending, and DCA. 20 interactive levels powered by the StarkZap SDK on Starknet Sepolia testnet. Every lesson is a real transaction.',
        status: 'live',
        navigateTo: 'IslandMap',
      },
      {
        id: 'starknet-defi-navigator',
        name: 'Starknet DeFi Navigator',
        type: 'SPECIFIC',
        worldThemeId: 'starknet-realm',
        worldLabel: '🧭 DeFi Navigator',
        tagline: 'From Island graduate to professional DeFi operator',
        description: '11 labs from DeFi mental models to institutional portfolio operations. Each lab uses Starknet Sepolia for live testnet transactions and the StarkZap SDK for execution. Junior · Intermediate · Senior · DeFi Navigator Certified.',
        status: 'live',
        navigateTo: 'StarknetTrack',
      },
    ],
  },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFieldDetail(fieldId: string): FieldDetail | undefined {
  return registry.find(d => d.fieldId === fieldId);
}

export function getAllFieldDetails(): FieldDetail[] {
  return registry;
}

export const LIVE_TRACK_IDS = new Set([
  'defi-research-analyst',
  'onchain-analyst',
  'quant-trader',
  'quant-developer',
  'quant-researcher',
  'supply-chain-analyst',
  'supply-chain-analyst-sc',
]);

export function isTrackLive(trackId: string): boolean {
  return LIVE_TRACK_IDS.has(trackId);
}