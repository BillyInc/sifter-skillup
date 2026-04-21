// ⚡ Sifter Skill_Up — Master Field Registry
// 28 Fields from: Sifter_SkillUp_Master_Role_Directory_v2.pdf
// + existing Crypto/Quant fields

export type HiringModel = 'GENERAL' | 'SPECIFIC' | 'MIXED';
export type FieldStatus = 'live' | 'coming_soon' | 'planned';

export interface CareerRole {
  title: string;
  type: 'GENERAL' | 'SPECIFIC';
  seniority?: string; // 'junior' | 'mid' | 'senior' | 'leadership'
}

export interface SalaryRange {
  junior: string;
  mid: string;
  senior: string;
  currency: string;
  note?: string;
}

export interface FieldPro {
  icon: string;
  text: string;
}

export interface Field {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  hiringModel: HiringModel;
  hiringModelNote: string;     // shown to user explaining how hiring works in this field
  status: FieldStatus;
  careerCount: number;         // approx number of distinct career paths
  roles: CareerRole[];
  primaryPlatformIds: string[];
  // Enrichment for decision-making (all optional so existing data stays valid)
  salaryRange?: SalaryRange;
  pros?: FieldPro[];
  cons?: FieldPro[];
  dayInLife?: string;          // 3-4 sentence description of a typical day
  whoIsItFor?: string;         // 1-2 sentences: who thrives here
  whoIsItNotFor?: string;      // 1-2 sentences: who struggles
  timeToHireable?: string;     // e.g. "6-12 months with focused study"
  demandTrend?: 'rising' | 'stable' | 'declining';
  remoteWork?: 'high' | 'medium' | 'low';
}

export const ALL_FIELDS: Field[] = [

  // ════════════════════════════════════════════════════════
  // EXISTING FIELDS (live in app)
  // ════════════════════════════════════════════════════════

  {
    id: 'crypto',
    name: 'Crypto / Web3',
    emoji: '₿',
    tagline: 'On-chain. Self-sovereign.',
    description: '270-level onboarding track covering Bitcoin, Ethereum, DeFi, wallets, trading and more. The most complete crypto education roadmap available.',
    color: '#f7931a',
    hiringModel: 'MIXED',
    hiringModelNote: 'Most crypto roles are SPECIFIC — companies post exact job titles like "Solidity Dev" or "DeFi Analyst". A few large exchanges hire broadly and place you on a team.',
    status: 'live',
    careerCount: 30,
    roles: [
      { title: 'DeFi Analyst', type: 'SPECIFIC' },
      { title: 'On-Chain Analyst', type: 'SPECIFIC' },
      { title: 'Smart Contract Developer', type: 'SPECIFIC' },
      { title: 'Crypto Compliance Analyst', type: 'SPECIFIC' },
      { title: 'Web3 Product Manager', type: 'SPECIFIC' },
      { title: 'Blockchain Security Auditor', type: 'SPECIFIC' },
      { title: 'Tokenomics Designer', type: 'SPECIFIC' },
      { title: 'Crypto Research Analyst', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'twitter', 'linkedin', 'etherscan'],
        salaryRange: { junior: '$45K–$75K', mid: '$80K–$140K', senior: '$150K–$300K+', currency: 'USD', note: 'Plus token compensation at many protocols — often 2–5× base' },
    pros: [
      { icon: '🌍', text: 'Work from anywhere — fully remote across virtually all crypto companies' },
      { icon: '💰', text: 'Token upside can be life-changing — early employees at major protocols made millions' },
      { icon: '⚡', text: 'Industry is rebuilding finance from scratch — you are at the frontier' },
      { icon: '📈', text: 'Demand massively outstrips supply — skilled people are always needed' },
    ],
    cons: [
      { icon: '🎢', text: 'Industry cycles hard with crypto prices — companies hire and freeze in waves' },
      { icon: '🦈', text: 'Scams, rug pulls, and hacks are common — you need good judgement on who to work for' },
      { icon: '📚', text: 'Technology moves fast — what you learn today may be obsolete in 18 months' },
      { icon: '😰', text: 'Bear markets are brutal — companies collapse, tokens go to zero, colleagues disappear' },
    ],
    dayInLife: 'You start by checking on-chain data and overnight market movements. The morning is meetings — protocol team calls, research discussions, or code reviews depending on your role. Afternoons are deep work: writing analysis, building contracts, or designing strategies. You finish by scanning Twitter and Discord for ecosystem updates. Most of your colleagues are pseudonymous.',
    whoIsItFor: 'People who are genuinely obsessed with the technology and willing to self-educate continuously. Those who thrive in ambiguity and want to be early at something.',
    whoIsItNotFor: 'People who need job stability, 9-to-5 structure, or who are primarily motivated by the financial speculation rather than the technology.',
    timeToHireable: '3-9 months with focused learning. Junior roles at smaller protocols are reachable faster.',
    demandTrend: 'rising',
    remoteWork: 'high',
  },

  {
    id: 'quant',
    name: 'Quantitative Finance',
    emoji: '⚡',
    tagline: 'Math, code, and edge.',
    description: 'Three tracks: Quant Trader, Quant Researcher, Quant Developer. Systematic strategies, statistical models, and high-performance trading infrastructure.',
    color: '#6366f1',
    hiringModel: 'MIXED',
    hiringModelNote: 'Top quant firms (Jane Street, Citadel, Two Sigma, DE Shaw) hire broadly as Quant Trader, Developer, or Researcher and specialise you on the desk. Banks hire specific roles directly.',
    status: 'coming_soon',
    careerCount: 26,
    roles: [
      { title: 'Quant Developer', type: 'GENERAL', seniority: 'junior' },
      { title: 'Quant Trader', type: 'GENERAL', seniority: 'junior' },
      { title: 'Quant Researcher', type: 'GENERAL', seniority: 'junior' },
      { title: 'Algorithmic Trader', type: 'SPECIFIC' },
      { title: 'Derivatives Trader', type: 'SPECIFIC' },
      { title: 'Risk Analyst — Quant', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'linkedin', 'quantconnect', 'ssrn'],
        salaryRange: { junior: '$200K–$400K', mid: '$400K–$800K', senior: '$800K–$3M+', currency: 'USD', note: 'Jane Street, Citadel, Two Sigma — total comp includes large bonus. Numbers are for top firms only.' },
    pros: [
      { icon: '💸', text: 'Highest total compensation of any technical career path — consistently' },
      { icon: '🧠', text: 'Intellectually demanding work — you are solving genuinely hard mathematical problems' },
      { icon: '🏆', text: 'Meritocratic to an unusual degree — performance is measurable and rewarded directly' },
      { icon: '🔒', text: 'Extremely stable employment — top firms almost never fire performing quants' },
    ],
    cons: [
      { icon: '🎓', text: 'Extremely competitive entry — top firms take mostly PhD graduates from top 10 universities' },
      { icon: '🏢', text: 'Limited remote work — most top quant firms require full-time office presence in expensive cities' },
      { icon: '🤐', text: 'Highly secretive environment — you cannot discuss your work publicly or put strategies on LinkedIn' },
      { icon: '⏰', text: 'Interview process is brutally long — 6-8 rounds including live coding, math derivations, and trading simulations' },
    ],
    dayInLife: `You arrive early to review overnight P&L and check your models' performance against live markets. The morning is usually deep research or strategy development — writing code, running backtests, reviewing statistics. After market close there are team discussions on what worked and what didn't. Evenings are often spent reading papers. The work is quiet, intense, and intellectually satisfying.`,
    whoIsItFor: 'People who genuinely love mathematics and statistics for their own sake, not just as tools. Competitive people who want to be at the absolute frontier of applied quantitative thinking.',
    whoIsItNotFor: 'People who want public recognition, flexible hours, or to work on products users can see. The work is invisible by design.',
    timeToHireable: '2-4 years of serious study plus a relevant degree. The junior curriculum gives you the mathematical foundation — getting hired at top firms requires additional undergraduate/graduate mathematics.',
    demandTrend: 'rising',
    remoteWork: 'low',
  },

  // ════════════════════════════════════════════════════════
  // 28 NEW FIELDS FROM PDF
  // ════════════════════════════════════════════════════════

  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    emoji: '🤖',
    tagline: 'Build the models that run the world.',
    description: 'From AI Engineer and ML Engineer generalist tracks to deep specialisations in Computer Vision, NLP, LLMs, and AI Safety. The fastest-growing field in tech.',
    color: '#6366f1',
    hiringModel: 'MIXED',
    hiringModelNote: 'Most companies hire you as "AI Engineer" or "ML Engineer" and specialise you on the team. At Google, Meta, OpenAI and DeepMind, roles like Computer Vision Engineer and LLM Engineer are posted directly.',
    status: 'coming_soon',
    careerCount: 30,
    roles: [
      { title: 'AI Engineer', type: 'GENERAL' },
      { title: 'Machine Learning Engineer', type: 'GENERAL' },
      { title: 'MLOps Engineer', type: 'SPECIFIC' },
      { title: 'Computer Vision Engineer', type: 'SPECIFIC' },
      { title: 'NLP Engineer', type: 'SPECIFIC' },
      { title: 'LLM Engineer', type: 'SPECIFIC' },
      { title: 'AI Safety Researcher', type: 'SPECIFIC' },
      { title: 'Generative AI Engineer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'huggingface', 'kaggle', 'linkedin'],
        salaryRange: { junior: '$120K–$180K', mid: '$180K–$280K', senior: '$280K–$600K+', currency: 'USD', note: 'Top AI companies (OpenAI, Anthropic, Google DeepMind) pay $300K–$900K+ total comp for strong candidates' },
    pros: [
      { icon: '🚀', text: 'Fastest growing field in tech — demand is increasing faster than supply at every level' },
      { icon: '💡', text: 'Work on genuinely frontier technology that is changing how humanity thinks and works' },
      { icon: '💰', text: 'Extremely high compensation — especially at frontier AI labs and top tech companies' },
      { icon: '🌍', text: 'Highly transferable — every industry is adopting AI, so you can work anywhere' },
    ],
    cons: [
      { icon: '📚', text: 'Deep math required — linear algebra, calculus, probability, statistics all needed to go beyond surface level' },
      { icon: '⚡', text: 'Pace is relentless — a major paper drops every week. Staying current is a full-time job inside your job' },
      { icon: '🔮', text: 'Role will change dramatically in 5-10 years as AI automates parts of ML engineering itself' },
      { icon: '🎓', text: 'Competitive at the top — frontier research roles still require strong academic credentials' },
    ],
    dayInLife: 'Morning is reviewing experiment results that ran overnight — did the model improve? Afternoon is usually writing code: building pipelines, running ablations, or debugging training runs. A lot of time is spent reading papers and discussing ideas with teammates. Deployment days are stressful — monitoring model performance in production and responding to regressions. The work is technically demanding but intellectually exciting.',
    whoIsItFor: 'People who are excited about mathematics, comfortable with ambiguity, and genuinely curious about how intelligence works. Strong Python skills are table stakes.',
    whoIsItNotFor: 'People who want to see immediate tangible results — experiments often fail, and models take weeks to train. Also not ideal for those who want clear 9-to-5 boundaries.',
    timeToHireable: '12-24 months of serious study for ML Engineering roles. Research roles require 3-5 years plus relevant publications or open-source contributions.',
    demandTrend: 'rising',
    remoteWork: 'medium',
  },

  {
    id: 'software-engineering',
    name: 'Software Engineering',
    emoji: '💻',
    tagline: 'Write the code that powers everything.',
    description: 'From Full Stack generalist to specialist tracks in React, Python, Go, iOS, Android, Game Dev, and systems programming. The broadest career field in tech.',
    color: '#0ea5e9',
    hiringModel: 'MIXED',
    hiringModelNote: 'FAANG-tier companies hire "Software Engineer" broadly and place you on a team. Most other companies specify the stack in the posting. Leadership roles are always general.',
    status: 'coming_soon',
    careerCount: 45,
    roles: [
      { title: 'Software Engineer', type: 'GENERAL' },
      { title: 'Full Stack Engineer', type: 'GENERAL' },
      { title: 'Frontend Engineer (React)', type: 'SPECIFIC' },
      { title: 'Backend Engineer (Python)', type: 'SPECIFIC' },
      { title: 'Mobile Engineer — iOS', type: 'SPECIFIC' },
      { title: 'Mobile Engineer — Android', type: 'SPECIFIC' },
      { title: 'Game Developer (Unity)', type: 'SPECIFIC' },
      { title: 'Blockchain Developer (Solidity)', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'linkedin', 'personal_site', 'stackoverflow'],
  },

  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    emoji: '☁️',
    tagline: 'Ship faster, scale to billions.',
    description: 'DevOps Engineer and SRE generalist tracks, plus specialist paths for AWS, Azure, GCP, Kubernetes, Terraform, and CI/CD engineering.',
    color: '#0ea5e9',
    hiringModel: 'MIXED',
    hiringModelNote: 'DevOps Engineer and SRE are platform-agnostic hires. Cloud Engineer postings always specify the platform (AWS, Azure, GCP). Kubernetes and Terraform specialists are hired directly at larger companies.',
    status: 'coming_soon',
    careerCount: 30,
    roles: [
      { title: 'DevOps Engineer', type: 'GENERAL' },
      { title: 'Site Reliability Engineer', type: 'GENERAL' },
      { title: 'Cloud Engineer — AWS', type: 'SPECIFIC' },
      { title: 'Cloud Engineer — Azure', type: 'SPECIFIC' },
      { title: 'Kubernetes Engineer', type: 'SPECIFIC' },
      { title: 'Terraform / IaC Engineer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'linkedin'],
  },

  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    emoji: '🛡️',
    tagline: 'Defend, detect, and disrupt.',
    description: '70+ specific roles across Security Operations, Offensive Security, Defensive Engineering, and GRC. Every role requires a specific lane — there is no generic cybersecurity hire.',
    color: '#ef4444',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Companies hire directly for each function from day one. SOC Analyst, Pen Tester, and GRC Analyst have entirely different certifications, interviews, and career ladders.',
    status: 'coming_soon',
    careerCount: 70,
    roles: [
      { title: 'SOC Analyst Tier 1', type: 'SPECIFIC', seniority: 'junior' },
      { title: 'Penetration Tester', type: 'SPECIFIC' },
      { title: 'Application Security Engineer', type: 'SPECIFIC' },
      { title: 'GRC Analyst', type: 'SPECIFIC' },
      { title: 'Threat Intelligence Analyst', type: 'SPECIFIC' },
      { title: 'Security Architect', type: 'SPECIFIC' },
      { title: 'Smart Contract Auditor', type: 'SPECIFIC' },
      { title: 'CISO', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['github', 'linkedin', 'hackthebox', 'tryhackme', 'bugcrowd'],
        salaryRange: { junior: '$60K–$90K', mid: '$90K–$140K', senior: '$140K–$250K+', currency: 'USD', note: 'Bug bounty hunters can earn $50K–$500K+ per year. CISO roles at major companies reach $400K+.' },
    pros: [
      { icon: '🛡️', text: 'Virtually every company needs security — no shortage of jobs in any market condition' },
      { icon: '🕵️', text: 'Intellectually engaging — adversarial work that requires creative thinking and constant learning' },
      { icon: '💰', text: 'Bug bounty and consulting create unlimited upside — top researchers earn more than senior full-time roles' },
      { icon: '🌍', text: 'Strong remote work culture — much of security work is done independently' },
    ],
    cons: [
      { icon: '⚠️', text: 'On-call stress — security incidents happen at 3am and someone has to respond' },
      { icon: '😤', text: 'Frustrating when developers ignore your findings or deprioritise patches' },
      { icon: '📖', text: 'Certifications are expensive and time-consuming — OSCP, CISSP, CEH all cost thousands' },
      { icon: '🔒', text: 'Clearance requirements limit some roles — government and defence work requires background checks' },
    ],
    dayInLife: 'Offensive roles: you spend the day probing systems for vulnerabilities — running tools, reading code, crafting payloads. Defensive roles: you monitor alerts, investigate suspicious activity, and write detection rules. Red team engagements have you planning and executing simulated attacks against client infrastructure. Most days involve a lot of documentation and communicating findings clearly to non-technical stakeholders.',
    whoIsItFor: 'Curious, persistent people who enjoy thinking like an adversary. Those who like puzzles and are comfortable with ambiguity and incomplete information.',
    whoIsItNotFor: 'People who want predictable, process-driven work. Security constantly throws unexpected challenges at you.',
    timeToHireable: '6-18 months for entry-level SOC/analyst roles. Penetration testing and red team roles typically require 2-3 years of hands-on practice.',
    demandTrend: 'rising',
    remoteWork: 'high',
  },

  {
    id: 'data-science',
    name: 'Data Science',
    emoji: '📊',
    tagline: 'Turn data into competitive advantage.',
    description: 'A single continuous career ladder from Junior Data Scientist to Chief Data Scientist. Companies hire broadly and specialise you on the team.',
    color: '#8b5cf6',
    hiringModel: 'GENERAL',
    hiringModelNote: 'The most commonly posted title is simply "Data Scientist". Specialisations emerge after hiring. Interviews test general ML and statistical ability across the board.',
    status: 'coming_soon',
    careerCount: 18,
    roles: [
      { title: 'Junior Data Scientist', type: 'GENERAL', seniority: 'junior' },
      { title: 'Data Scientist', type: 'GENERAL', seniority: 'mid' },
      { title: 'Senior Data Scientist', type: 'GENERAL', seniority: 'senior' },
      { title: 'Research Scientist', type: 'GENERAL' },
      { title: 'Applied Scientist', type: 'GENERAL' },
      { title: 'Chief Data Scientist', type: 'GENERAL', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['github', 'kaggle', 'linkedin', 'tableau_public'],
  },

  {
    id: 'data-analysis-bi',
    name: 'Data Analysis & BI',
    emoji: '📈',
    tagline: 'Find the insight inside the noise.',
    description: '60+ specific roles across General Analytics, Business Intelligence, Product & Growth Analytics, Marketing Analytics, Finance Analytics, and People Analytics.',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Nobody is hired as a "generic data analyst". Companies post Marketing Analyst, Product Analyst, Financial Analyst from day one — domain knowledge is required at interview.',
    status: 'coming_soon',
    careerCount: 65,
    roles: [
      { title: 'Product Analyst', type: 'SPECIFIC' },
      { title: 'Marketing Analyst', type: 'SPECIFIC' },
      { title: 'BI Developer — Power BI', type: 'SPECIFIC' },
      { title: 'BI Developer — Tableau', type: 'SPECIFIC' },
      { title: 'Financial Analyst', type: 'SPECIFIC' },
      { title: 'Growth Analyst', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['tableau_public', 'linkedin', 'github'],
  },

  {
    id: 'data-engineering',
    name: 'Data Engineering',
    emoji: '⚙️',
    tagline: 'Build the pipes that data flows through.',
    description: '30+ specific roles across core Data Engineering, Big Data (Spark/Kafka), Analytics Engineering (dbt), Cloud Data, and Data Governance.',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. The technology stack in the job description defines the actual role — even if the title says "Data Engineer". Snowflake, dbt, Kafka specialists are hired directly.',
    status: 'coming_soon',
    careerCount: 32,
    roles: [
      { title: 'Data Engineer', type: 'SPECIFIC' },
      { title: 'Analytics Engineer — dbt', type: 'SPECIFIC' },
      { title: 'Big Data Engineer — Spark', type: 'SPECIFIC' },
      { title: 'Streaming Data Engineer — Kafka', type: 'SPECIFIC' },
      { title: 'Data Warehouse Engineer — Snowflake', type: 'SPECIFIC' },
      { title: 'Cloud Data Engineer — AWS', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'linkedin', 'dbt_hub'],
  },

  {
    id: 'product-design',
    name: 'Product & Design',
    emoji: '🎨',
    tagline: 'Shape how the world interacts with technology.',
    description: 'Product Manager generalist track plus specialist paths for UI Design, UX Research, Motion Design, and Design Systems.',
    color: '#ec4899',
    hiringModel: 'MIXED',
    hiringModelNote: 'PM and entry-level UX Designer are general hires at most companies. UX Researcher, UI Designer, UX Writer, and Motion Designer are specific roles companies post for directly.',
    status: 'coming_soon',
    careerCount: 42,
    roles: [
      { title: 'Product Manager', type: 'GENERAL' },
      { title: 'UX Designer', type: 'GENERAL', seniority: 'junior' },
      { title: 'UI Designer', type: 'SPECIFIC' },
      { title: 'Product Designer', type: 'SPECIFIC' },
      { title: 'UX Researcher', type: 'SPECIFIC' },
      { title: 'Motion Designer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['behance', 'dribbble', 'linkedin'],
  },

  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    emoji: '📣',
    tagline: 'Get the right message to the right person.',
    description: '80+ specific roles across SEO, Paid Search, Paid Social, Content & Brand, Email & CRM, Affiliate & Growth, and Marketing Analytics.',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. SEO, PPC, paid social, email, and content are distinct career paths with different tools, certifications, and salary bands. There is no generic "digital marketer" hire above 20 employees.',
    status: 'coming_soon',
    careerCount: 85,
    roles: [
      { title: 'SEO Specialist', type: 'SPECIFIC' },
      { title: 'PPC Specialist', type: 'SPECIFIC' },
      { title: 'Paid Social Specialist — Meta', type: 'SPECIFIC' },
      { title: 'Email Marketing Specialist', type: 'SPECIFIC' },
      { title: 'Content Marketing Manager', type: 'SPECIFIC' },
      { title: 'Growth Marketing Manager', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'supply-chain',
    name: 'Supply Chain & Operations',
    emoji: '🔗',
    tagline: 'Move things. Fast. Efficiently.',
    description: '80+ specific roles across Procurement, Planning & Forecasting, Logistics, Operations & Quality, and Supply Chain Strategy.',
    color: '#0ea5e9',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. A Demand Planner, Procurement Analyst, and Logistics Coordinator have entirely different skills, tools, and interview processes. Nobody is hired as a generic "supply chain person".',
    status: 'coming_soon',
    careerCount: 82,
    roles: [
      { title: 'Procurement Analyst', type: 'SPECIFIC' },
      { title: 'Demand Planner', type: 'SPECIFIC' },
      { title: 'Logistics Coordinator', type: 'SPECIFIC' },
      { title: 'Supply Chain Analyst', type: 'SPECIFIC' },
      { title: 'Inventory Manager', type: 'SPECIFIC' },
      { title: 'Chief Supply Chain Officer', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
        salaryRange: { junior: '$45K–$70K', mid: '$75K–$110K', senior: '$110K–$180K', currency: 'USD', note: 'CSCP/CPIM certification adds £10-20K in the UK. Senior roles at multinationals reach $200K+ with bonus.' },
    pros: [
      { icon: '🌍', text: 'Every industry needs supply chain — retail, pharma, aerospace, food, automotive. You are never stuck' },
      { icon: '📊', text: 'Highly analytical — you use real data every day: inventory, demand, costs, suppliers' },
      { icon: '🤝', text: 'Broad influence — you work across the whole business, not siloed in one function' },
      { icon: '🏭', text: 'Tangible impact — when you fix something, products actually reach people faster and cheaper' },
    ],
    cons: [
      { icon: '🏢', text: 'Most roles are office/hybrid at best — significant travel to warehouses, factories, and supplier sites' },
      { icon: '📞', text: 'High stress during disruptions — port strikes, COVID, supplier failures — you own the problem' },
      { icon: '📈', text: 'Slower salary growth than tech — senior salaries are solid but not Silicon Valley levels' },
      { icon: '🔄', text: 'Work can be repetitive — a lot of Excel, ERP systems, and weekly status meetings' },
    ],
    dayInLife: `You start with the daily exception report — what's out of stock, what's delayed, what supplier just called with a problem. The morning is largely reactive: firefighting, phone calls, updating forecasts. Afternoons are more strategic: building analyses for the S&OP meeting, reviewing supplier contracts, or presenting a cost-reduction recommendation. You finish by checking the next day's inbound deliveries.`,
    whoIsItFor: 'Organised, data-driven people who can stay calm under pressure. People who like fixing problems that have real physical consequences and want a stable, well-respected career path.',
    whoIsItNotFor: 'People who want fully remote work or fast Silicon Valley-style career progression. The field rewards tenure and institutional knowledge more than it rewards raw intelligence.',
    timeToHireable: '6-18 months. The junior track gets you to entry-level analyst roles. APICS/ASCM certification significantly accelerates hiring.',
    demandTrend: 'rising',
    remoteWork: 'low',
  },

  {
    id: 'fintech-blockchain',
    name: 'Fintech & Blockchain',
    emoji: '🏦',
    tagline: 'Code the future of finance.',
    description: '30+ specific roles across Blockchain Development (Solidity/Rust), Security & Audit, and Analysis & Strategy.',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Solidity and Rust are entirely different skill sets with different interview processes. DeFi Analyst and Crypto Compliance Analyst also require distinct domain knowledge from day one.',
    status: 'coming_soon',
    careerCount: 30,
    roles: [
      { title: 'Blockchain Developer — Solidity', type: 'SPECIFIC' },
      { title: 'Blockchain Developer — Rust / Solana', type: 'SPECIFIC' },
      { title: 'Smart Contract Auditor', type: 'SPECIFIC' },
      { title: 'DeFi Analyst', type: 'SPECIFIC' },
      { title: 'Zero-Knowledge Engineer', type: 'SPECIFIC' },
      { title: 'Web3 Product Manager', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'linkedin', 'etherscan', 'code4rena'],
  },

  {
    id: 'renewable-energy',
    name: 'Renewable Energy & ESG',
    emoji: '🌱',
    tagline: 'Engineer a sustainable future.',
    description: 'Renewable Energy Engineer generalist track plus specific paths for Solar, Wind, EV Systems, Battery Storage, ESG Analysis, and Climate Risk.',
    color: '#10b981',
    hiringModel: 'MIXED',
    hiringModelNote: 'Renewable Energy Engineer exists as a general hire at some companies. ESG Analyst, Carbon Accounting Specialist, and Climate Risk Analyst are specific roles with different certifications and stakeholders.',
    status: 'coming_soon',
    careerCount: 32,
    roles: [
      { title: 'Renewable Energy Engineer', type: 'GENERAL' },
      { title: 'Solar Energy Engineer', type: 'SPECIFIC' },
      { title: 'ESG Analyst', type: 'SPECIFIC' },
      { title: 'Carbon Accounting Specialist', type: 'SPECIFIC' },
      { title: 'Climate Risk Analyst', type: 'SPECIFIC' },
      { title: 'Chief Sustainability Officer', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'project-management',
    name: 'Project & Program Management',
    emoji: '📋',
    tagline: 'Deliver on time. Every time.',
    description: 'Project Manager and Program Manager generalist tracks plus specific paths for Scrum Master, Technical PM, Agile Coach, and domain-specific PMs.',
    color: '#8b5cf6',
    hiringModel: 'MIXED',
    hiringModelNote: 'Project Manager and Program Manager are general hires across all industries. Scrum Master, IT PM, Technical PM, and Construction PM require specific certifications from day one.',
    status: 'coming_soon',
    careerCount: 28,
    roles: [
      { title: 'Project Manager', type: 'GENERAL' },
      { title: 'Program Manager', type: 'GENERAL' },
      { title: 'Scrum Master', type: 'SPECIFIC' },
      { title: 'Agile Coach', type: 'SPECIFIC' },
      { title: 'Technical Project Manager', type: 'SPECIFIC' },
      { title: 'Construction Project Manager', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'healthcare-nonclinical',
    name: 'Healthcare (Non-Clinical)',
    emoji: '🏥',
    tagline: 'Where data meets human outcomes.',
    description: '35+ specific roles across Health Informatics, Clinical Data Management, Medical Writing, Regulatory Affairs, and Pharmacovigilance.',
    color: '#ef4444',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Non-clinical healthcare roles are highly regulated. Health informatics, medical writing, and pharmacovigilance are entirely distinct career paths with different education requirements.',
    status: 'coming_soon',
    careerCount: 35,
    roles: [
      { title: 'Health Informatics Analyst', type: 'SPECIFIC' },
      { title: 'Clinical Data Manager', type: 'SPECIFIC' },
      { title: 'Medical Writer', type: 'SPECIFIC' },
      { title: 'Regulatory Affairs Specialist', type: 'SPECIFIC' },
      { title: 'Pharmacovigilance Specialist', type: 'SPECIFIC' },
      { title: 'HEOR Analyst', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'researchgate'],
  },

  {
    id: 'legal-compliance',
    name: 'Legal & Compliance',
    emoji: '⚖️',
    tagline: 'Navigate the rules that govern everything.',
    description: '45+ specific roles across Compliance & Risk, Legal Operations, and Regulatory & Governance. AML, GDPR, and Trade Compliance require entirely different expertise.',
    color: '#64748b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. AML is not interchangeable with GDPR Compliance or Trade Compliance. Each requires specific certifications, regulatory knowledge, and industry experience.',
    status: 'coming_soon',
    careerCount: 45,
    roles: [
      { title: 'AML Analyst', type: 'SPECIFIC' },
      { title: 'KYC Analyst', type: 'SPECIFIC' },
      { title: 'GRC Analyst', type: 'SPECIFIC' },
      { title: 'Data Privacy Analyst — GDPR', type: 'SPECIFIC' },
      { title: 'Regulatory Affairs Specialist', type: 'SPECIFIC' },
      { title: 'Chief Compliance Officer', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'human-resources',
    name: 'Human Resources',
    emoji: '👥',
    tagline: 'Build the teams that build everything else.',
    description: 'HR Generalist entry path plus specific tracks for Talent Acquisition, Compensation & Benefits, L&D, People Analytics, and DEI.',
    color: '#ec4899',
    hiringModel: 'MIXED',
    hiringModelNote: 'HR Coordinator and HR Generalist are broad entry points at most companies. Talent Acquisition, Comp & Ben, L&D, and People Analytics are distinct specialist tracks that larger companies hire directly for.',
    status: 'coming_soon',
    careerCount: 48,
    roles: [
      { title: 'HR Generalist', type: 'GENERAL' },
      { title: 'Recruiter', type: 'SPECIFIC' },
      { title: 'Technical Recruiter', type: 'SPECIFIC' },
      { title: 'Compensation Analyst', type: 'SPECIFIC' },
      { title: 'L&D Specialist', type: 'SPECIFIC' },
      { title: 'People Analytics Specialist', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'sales-revenue',
    name: 'Sales & Revenue',
    emoji: '💰',
    tagline: 'Close deals. Drive revenue.',
    description: '70+ specific roles across Prospecting (SDR/BDR), Account Executive, Customer Success, Technical Sales, and Revenue Operations.',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. SDR, AE, CSM, and Sales Engineer have different skill sets, compensation structures (salary vs OTE), and career paths. They are never interchangeable.',
    status: 'coming_soon',
    careerCount: 72,
    roles: [
      { title: 'Sales Development Representative', type: 'SPECIFIC' },
      { title: 'Account Executive — SMB', type: 'SPECIFIC' },
      { title: 'Account Executive — Enterprise', type: 'SPECIFIC' },
      { title: 'Customer Success Manager', type: 'SPECIFIC' },
      { title: 'Sales Engineer', type: 'SPECIFIC' },
      { title: 'Chief Revenue Officer', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'writing-content',
    name: 'Writing & Content',
    emoji: '✍️',
    tagline: 'Words that move people to act.',
    description: '40+ specific roles across Technical Writing, Medical Writing, Legal Writing, Copywriting, Content Strategy, and Speechwriting.',
    color: '#64748b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. A Technical Writer and a Copywriter have entirely different portfolios and interview processes. Medical and legal writing require domain expertise from day one.',
    status: 'coming_soon',
    careerCount: 40,
    roles: [
      { title: 'Technical Writer', type: 'SPECIFIC' },
      { title: 'UX Writer', type: 'SPECIFIC' },
      { title: 'Medical Writer', type: 'SPECIFIC' },
      { title: 'Copywriter', type: 'SPECIFIC' },
      { title: 'SEO Content Writer', type: 'SPECIFIC' },
      { title: 'Content Strategist', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site', 'medium', 'contently'],
  },

  {
    id: 'creative-media',
    name: 'Creative & Media',
    emoji: '🎬',
    tagline: 'Make things that make people feel.',
    description: '50+ specific roles across Video Production, Animation, Audio, Game Development, and Illustration. Platform depends entirely on your discipline.',
    color: '#8b5cf6',
    hiringModel: 'MIXED',
    hiringModelNote: 'Game Designer and Creative Director are general hires at studios. All production roles — video editing, animation, audio, VFX — are specific disciplines with distinct software portfolios required from day one.',
    status: 'coming_soon',
    careerCount: 52,
    roles: [
      { title: 'Game Designer', type: 'GENERAL' },
      { title: 'Video Editor', type: 'SPECIFIC' },
      { title: '3D Animator', type: 'SPECIFIC' },
      { title: 'Sound Designer', type: 'SPECIFIC' },
      { title: 'VFX Artist', type: 'SPECIFIC' },
      { title: 'Concept Artist', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['behance', 'artstation', 'vimeo', 'youtube', 'soundcloud'],
  },

  {
    id: 'specialized-engineering',
    name: 'Specialized Engineering',
    emoji: '🔧',
    tagline: 'Engineer the physical world.',
    description: '50+ specific engineering disciplines: Mechanical, Civil, Electrical, Chemical, Aerospace, and Robotics. No overlap between disciplines.',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Structural Engineer and Electrical Engineer have no educational, licensing, or interview overlap. Each discipline is a 4+ year degree program and distinct career path.',
    status: 'coming_soon',
    careerCount: 50,
    roles: [
      { title: 'Mechanical Engineer', type: 'SPECIFIC' },
      { title: 'Structural Engineer', type: 'SPECIFIC' },
      { title: 'Electrical Engineer', type: 'SPECIFIC' },
      { title: 'Aerospace Engineer', type: 'SPECIFIC' },
      { title: 'Robotics Engineer', type: 'SPECIFIC' },
      { title: 'Process Safety Engineer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'researchgate', 'personal_site'],
  },

  {
    id: 'real-estate',
    name: 'Real Estate & Construction',
    emoji: '🏗️',
    tagline: 'Build and invest in the built environment.',
    description: '30+ specific roles across Real Estate Finance & Investment, Development & Planning, Property Management, and Construction Management.',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. A Real Estate Financial Modeler, Property Manager, and Construction PM have nothing in common in skills, interviews, or certifications.',
    status: 'coming_soon',
    careerCount: 30,
    roles: [
      { title: 'Real Estate Investment Analyst', type: 'SPECIFIC' },
      { title: 'Real Estate Financial Modeler', type: 'SPECIFIC' },
      { title: 'Property Manager', type: 'SPECIFIC' },
      { title: 'Construction Project Manager', type: 'SPECIFIC' },
      { title: 'Urban Planner', type: 'SPECIFIC' },
      { title: 'REIT Analyst', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'education-technology',
    name: 'Education Technology',
    emoji: '📚',
    tagline: 'Design learning that actually works.',
    description: '30+ specific roles across Instructional Design, eLearning Development, LMS Administration, Corporate Training, and EdTech Product.',
    color: '#6366f1',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Instructional Designer, eLearning Developer, and Corporate Trainer have different software stacks, skills, and outputs. LMS platform is always specified in postings.',
    status: 'coming_soon',
    careerCount: 30,
    roles: [
      { title: 'Instructional Designer', type: 'SPECIFIC' },
      { title: 'eLearning Developer — Articulate', type: 'SPECIFIC' },
      { title: 'LMS Administrator', type: 'SPECIFIC' },
      { title: 'Corporate Trainer', type: 'SPECIFIC' },
      { title: 'Learning Experience Designer', type: 'SPECIFIC' },
      { title: 'EdTech Product Manager', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site', 'articulate_community'],
  },

  {
    id: 'logistics-trade',
    name: 'Logistics & Trade',
    emoji: '🚢',
    tagline: 'Move goods across the globe.',
    description: '25+ specific roles across Freight Forwarding, Customs Brokerage, Trade Compliance, Port Operations, and Logistics Technology.',
    color: '#0ea5e9',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Customs Broker requires federal licensing. Freight Forwarding requires Incoterms knowledge. These are distinct regulated professions.',
    status: 'coming_soon',
    careerCount: 28,
    roles: [
      { title: 'Freight Forwarder', type: 'SPECIFIC' },
      { title: 'Customs Broker', type: 'SPECIFIC' },
      { title: 'Trade Compliance Specialist', type: 'SPECIFIC' },
      { title: 'Import / Export Specialist', type: 'SPECIFIC' },
      { title: 'Supply Chain Risk Analyst', type: 'SPECIFIC' },
      { title: 'Global Trade Manager', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'personal_site'],
  },

  {
    id: 'insurance-actuarial',
    name: 'Insurance & Actuarial',
    emoji: '📉',
    tagline: 'Price risk. Protect people.',
    description: '30+ specific roles across Actuarial Science (with CAS/SOA exam progression), Underwriting, and Insurance Operations.',
    color: '#6366f1',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. Actuarial science requires passing CAS or SOA professional exams over years. Underwriters, claims analysts, and actuaries are distinct disciplines with separate career ladders.',
    status: 'coming_soon',
    careerCount: 32,
    roles: [
      { title: 'Actuarial Analyst', type: 'SPECIFIC', seniority: 'junior' },
      { title: 'Fellow of the Casualty Actuarial Society', type: 'SPECIFIC' },
      { title: 'Underwriter — Property & Casualty', type: 'SPECIFIC' },
      { title: 'Underwriter — Cyber Insurance', type: 'SPECIFIC' },
      { title: 'Claims Adjuster', type: 'SPECIFIC' },
      { title: 'Chief Risk Officer', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'researchgate'],
  },

  {
    id: 'public-sector-ngo',
    name: 'Public Sector & NGO',
    emoji: '🌍',
    tagline: 'Work that matters beyond the bottom line.',
    description: '28+ roles. International Development Consultants are general hires at consulting firms. All government agency and NGO roles are specific — Policy Analyst, M&E Specialist, Grant Manager.',
    color: '#10b981',
    hiringModel: 'MIXED',
    hiringModelNote: 'Consulting firms (Deloitte Government, USAID partners) hire broadly as "Development Consultant". Agencies like the UN, World Bank, and national NGOs post specific roles from day one.',
    status: 'coming_soon',
    careerCount: 28,
    roles: [
      { title: 'International Development Consultant', type: 'GENERAL' },
      { title: 'Policy Analyst', type: 'SPECIFIC' },
      { title: 'M&E Specialist', type: 'SPECIFIC' },
      { title: 'Grant Manager', type: 'SPECIFIC' },
      { title: 'Program Officer — NGO', type: 'SPECIFIC' },
      { title: 'Country Director', type: 'SPECIFIC', seniority: 'leadership' },
    ],
    primaryPlatformIds: ['linkedin', 'reliefweb'],
  },

  {
    id: 'agriculture-tech',
    name: 'Agriculture Technology',
    emoji: '🌾',
    tagline: 'Feed the world with data.',
    description: '22+ specific roles across Precision Agriculture, AgriTech Software, Remote Sensing, Food Safety, and Agricultural Finance.',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. AgriTech is emerging but highly specialised. Precision agriculture, food safety, and crop science all require domain expertise from day one.',
    status: 'coming_soon',
    careerCount: 22,
    roles: [
      { title: 'Precision Agriculture Specialist', type: 'SPECIFIC' },
      { title: 'Agri-Data Analyst', type: 'SPECIFIC' },
      { title: 'Drone / UAV Operations Specialist', type: 'SPECIFIC' },
      { title: 'Food Safety Analyst', type: 'SPECIFIC' },
      { title: 'AgriFinance Analyst', type: 'SPECIFIC' },
      { title: 'Agri-AI / ML Engineer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['linkedin', 'github'],
  },

  {
    id: 'computational-science',
    name: 'Computational Science',
    emoji: '🔬',
    tagline: 'Simulate the universe with code.',
    description: '38+ specific roles across Computational Biology, Computational Physics, Computational Chemistry, and Engineering Simulation.',
    color: '#8b5cf6',
    hiringModel: 'SPECIFIC',
    hiringModelNote: 'ALL roles are SPECIFIC. There is no generic "Computational Scientist" hire. The domain is in the title — Computational Biologist requires biology + coding. These are distinct degrees and labs.',
    status: 'coming_soon',
    careerCount: 38,
    roles: [
      { title: 'Computational Biologist', type: 'SPECIFIC' },
      { title: 'Bioinformatics Scientist', type: 'SPECIFIC' },
      { title: 'Computational Physicist', type: 'SPECIFIC' },
      { title: 'CFD Engineer', type: 'SPECIFIC' },
      { title: 'Digital Twin Engineer', type: 'SPECIFIC' },
      { title: 'HPC Engineer', type: 'SPECIFIC' },
    ],
    primaryPlatformIds: ['github', 'arxiv', 'researchgate'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getField(id: string): Field | undefined {
  return ALL_FIELDS.find(f => f.id === id);
}

export function getLiveFields(): Field[] {
  return ALL_FIELDS.filter(f => f.status === 'live');
}

export function getComingSoonFields(): Field[] {
  return ALL_FIELDS.filter(f => f.status === 'coming_soon');
}

// Group fields by first letter for alphabetical browse
export function getFieldsGrouped(): Record<string, Field[]> {
  const groups: Record<string, Field[]> = {};
  ALL_FIELDS.forEach(f => {
    const letter = f.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(f);
  });
  return groups;
}
