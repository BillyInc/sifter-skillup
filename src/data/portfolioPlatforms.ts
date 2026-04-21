// ⚡ Sifter Skill_Up — Portfolio Platform Directory
// 28 Fields × N Platforms — drives the Portfolio Hub feature
// Generated from: Sifter_SkillUp_Master_Role_Directory_v2.pdf

export type PlatformIntegrationType =
  | 'oauth'        // Full OAuth — can auto-create account + post on behalf
  | 'api_key'      // API key auth — post programmatically
  | 'deep_link'    // Open platform's signup/profile URL with pre-filled params
  | 'package'      // Generate submission package (PDF cover + files) for manual upload
  | 'link_only';   // Just store and display the profile link

export interface PortfolioPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;             // emoji
  color: string;            // hex
  integration: PlatformIntegrationType;
  oauthScopes?: string[];   // for oauth type
  signupUrl: string;        // deeplink to pre-filled signup
  profileUrlTemplate: string; // e.g. "https://github.com/{username}"
  what_to_post: string;     // concise guidance shown in app
  api_available: boolean;
  notes?: string;
}

export interface FieldPlatforms {
  fieldId: string;
  fieldName: string;
  emoji: string;
  color: string;
  hiringModel: 'GENERAL' | 'SPECIFIC' | 'MIXED';
  primaryPlatforms: string[];   // platform ids — essential, recruiters check these first
  secondaryPlatforms: string[]; // platform ids — builds reach and community
  fieldNotes: string;           // shown to user when they open this field
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PLATFORM REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORMS: Record<string, PortfolioPlatform> = {

  github: {
    id: 'github', name: 'GitHub', url: 'https://github.com',
    icon: '🐙', color: '#24292e',
    integration: 'oauth',
    oauthScopes: ['repo', 'user', 'read:user'],
    signupUrl: 'https://github.com/join',
    profileUrlTemplate: 'https://github.com/{username}',
    what_to_post: 'Code projects, notebooks, scripts, pipelines, contracts',
    api_available: true,
  },

  linkedin: {
    id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com',
    icon: '💼', color: '#0077b5',
    integration: 'oauth',
    oauthScopes: ['r_liteprofile', 'w_member_social'],
    signupUrl: 'https://www.linkedin.com/signup',
    profileUrlTemplate: 'https://linkedin.com/in/{username}',
    what_to_post: 'Certifications, project write-ups, career milestones',
    api_available: true,
  },

  twitter: {
    id: 'twitter', name: 'Twitter / X', url: 'https://twitter.com',
    icon: '🐦', color: '#1da1f2',
    integration: 'oauth',
    oauthScopes: ['tweet.read', 'tweet.write', 'users.read'],
    signupUrl: 'https://twitter.com/i/flow/signup',
    profileUrlTemplate: 'https://twitter.com/{username}',
    what_to_post: 'Project launches, threads, community presence',
    api_available: true,
  },

  instagram: {
    id: 'instagram', name: 'Instagram', url: 'https://instagram.com',
    icon: '📸', color: '#e1306c',
    integration: 'deep_link',
    signupUrl: 'https://www.instagram.com/accounts/emailsignup/',
    profileUrlTemplate: 'https://instagram.com/{username}',
    what_to_post: 'Visual work — design, photography, brand, NFT art',
    api_available: true,
    notes: 'Requires Meta Business account for API posting',
  },

  facebook: {
    id: 'facebook', name: 'Facebook', url: 'https://facebook.com',
    icon: '👥', color: '#1877f2',
    integration: 'deep_link',
    signupUrl: 'https://www.facebook.com/r.php',
    profileUrlTemplate: 'https://facebook.com/{username}',
    what_to_post: 'Project pages, group posts, professional updates',
    api_available: true,
    notes: 'Graph API — requires Page access for posting',
  },

  reddit: {
    id: 'reddit', name: 'Reddit', url: 'https://reddit.com',
    icon: '🤖', color: '#ff4500',
    integration: 'oauth',
    oauthScopes: ['submit', 'identity'],
    signupUrl: 'https://www.reddit.com/register',
    profileUrlTemplate: 'https://reddit.com/u/{username}',
    what_to_post: 'Show HN-style posts, project launches, community posts in relevant subreddits',
    api_available: true,
  },

  upwork: {
    id: 'upwork', name: 'Upwork', url: 'https://upwork.com',
    icon: '💼', color: '#14a800',
    integration: 'deep_link',
    signupUrl: 'https://www.upwork.com/signup/',
    profileUrlTemplate: 'https://upwork.com/freelancers/{username}',
    what_to_post: 'Freelance portfolio, work history, client reviews',
    api_available: false,
    notes: 'No posting API — app generates profile setup guide',
  },

  freelancer: {
    id: 'freelancer', name: 'Freelancer.com', url: 'https://freelancer.com',
    icon: '🔧', color: '#29b2fe',
    integration: 'deep_link',
    signupUrl: 'https://www.freelancer.com/signup',
    profileUrlTemplate: 'https://freelancer.com/u/{username}',
    what_to_post: 'Portfolio projects, skills, hourly rate',
    api_available: false,
  },

  fiverr: {
    id: 'fiverr', name: 'Fiverr', url: 'https://fiverr.com',
    icon: '💚', color: '#1dbf73',
    integration: 'deep_link',
    signupUrl: 'https://www.fiverr.com/join',
    profileUrlTemplate: 'https://fiverr.com/{username}',
    what_to_post: 'Gig packages — writing, design, video editing, dev services',
    api_available: false,
  },

  behance: {
    id: 'behance', name: 'Behance', url: 'https://behance.net',
    icon: '🎨', color: '#053eff',
    integration: 'oauth',
    oauthScopes: ['activity_read', 'project_read', 'project_write'],
    signupUrl: 'https://www.behance.net/signup',
    profileUrlTemplate: 'https://behance.net/{username}',
    what_to_post: 'Full design case studies with process, wireframes, final output',
    api_available: true,
  },

  dribbble: {
    id: 'dribbble', name: 'Dribbble', url: 'https://dribbble.com',
    icon: '🏀', color: '#ea4c89',
    integration: 'oauth',
    oauthScopes: ['public', 'upload'],
    signupUrl: 'https://dribbble.com/signup',
    profileUrlTemplate: 'https://dribbble.com/{username}',
    what_to_post: 'UI design shots, visual work, animations',
    api_available: true,
  },

  kaggle: {
    id: 'kaggle', name: 'Kaggle', url: 'https://kaggle.com',
    icon: '📊', color: '#20beff',
    integration: 'api_key',
    signupUrl: 'https://www.kaggle.com/account/login?phase=startRegisterPage',
    profileUrlTemplate: 'https://kaggle.com/{username}',
    what_to_post: 'Notebooks, competition results, datasets',
    api_available: true,
  },

  huggingface: {
    id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co',
    icon: '🤗', color: '#ff9d00',
    integration: 'api_key',
    signupUrl: 'https://huggingface.co/join',
    profileUrlTemplate: 'https://huggingface.co/{username}',
    what_to_post: 'Fine-tuned models, datasets, Spaces (live demos)',
    api_available: true,
  },

  medium: {
    id: 'medium', name: 'Medium', url: 'https://medium.com',
    icon: '✍️', color: '#000000',
    integration: 'api_key',
    signupUrl: 'https://medium.com/m/signin',
    profileUrlTemplate: 'https://medium.com/@{username}',
    what_to_post: 'Project write-ups, technical articles, research summaries',
    api_available: true,
    notes: 'Integration token — stories published via API',
  },

  substack: {
    id: 'substack', name: 'Substack', url: 'https://substack.com',
    icon: '📰', color: '#ff6719',
    integration: 'deep_link',
    signupUrl: 'https://substack.com/signup',
    profileUrlTemplate: 'https://{username}.substack.com',
    what_to_post: 'Newsletter, research reports, technical writing',
    api_available: false,
  },

  youtube: {
    id: 'youtube', name: 'YouTube', url: 'https://youtube.com',
    icon: '▶️', color: '#ff0000',
    integration: 'oauth',
    oauthScopes: ['https://www.googleapis.com/auth/youtube.upload'],
    signupUrl: 'https://www.youtube.com/create_channel',
    profileUrlTemplate: 'https://youtube.com/@{username}',
    what_to_post: 'Project demos, tutorial content, explainer videos',
    api_available: true,
  },

  vimeo: {
    id: 'vimeo', name: 'Vimeo', url: 'https://vimeo.com',
    icon: '🎬', color: '#1ab7ea',
    integration: 'oauth',
    oauthScopes: ['upload', 'public'],
    signupUrl: 'https://vimeo.com/join',
    profileUrlTemplate: 'https://vimeo.com/{username}',
    what_to_post: 'Video showreel, design work, animations, cinematography',
    api_available: true,
  },

  artstation: {
    id: 'artstation', name: 'ArtStation', url: 'https://artstation.com',
    icon: '🖼️', color: '#13aff0',
    integration: 'deep_link',
    signupUrl: 'https://www.artstation.com/signup',
    profileUrlTemplate: 'https://artstation.com/{username}',
    what_to_post: '3D art, concept art, VFX, game art — industry standard',
    api_available: false,
  },

  soundcloud: {
    id: 'soundcloud', name: 'SoundCloud', url: 'https://soundcloud.com',
    icon: '🎵', color: '#ff5500',
    integration: 'oauth',
    oauthScopes: ['non-expiring'],
    signupUrl: 'https://soundcloud.com/signup',
    profileUrlTemplate: 'https://soundcloud.com/{username}',
    what_to_post: 'Music production, sound design, audio engineering work',
    api_available: true,
  },

  stackoverflow: {
    id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com',
    icon: '📚', color: '#f48024',
    integration: 'deep_link',
    signupUrl: 'https://stackoverflow.com/users/signup',
    profileUrlTemplate: 'https://stackoverflow.com/users/{username}',
    what_to_post: 'Reputation score, answered questions, technical expertise',
    api_available: false,
  },

  tableau_public: {
    id: 'tableau_public', name: 'Tableau Public', url: 'https://public.tableau.com',
    icon: '📈', color: '#e97627',
    integration: 'deep_link',
    signupUrl: 'https://public.tableau.com/app/discover',
    profileUrlTemplate: 'https://public.tableau.com/profile/{username}',
    what_to_post: 'Interactive dashboards, data visualisations',
    api_available: false,
  },

  quantconnect: {
    id: 'quantconnect', name: 'QuantConnect', url: 'https://quantconnect.com',
    icon: '📉', color: '#009688',
    integration: 'api_key',
    signupUrl: 'https://www.quantconnect.com/register',
    profileUrlTemplate: 'https://quantconnect.com/u/{username}',
    what_to_post: 'Backtested strategy results, Sharpe ratio, drawdown stats',
    api_available: true,
  },

  hackthebox: {
    id: 'hackthebox', name: 'HackTheBox', url: 'https://hackthebox.com',
    icon: '🟩', color: '#9fef00',
    integration: 'deep_link',
    signupUrl: 'https://app.hackthebox.com/register',
    profileUrlTemplate: 'https://app.hackthebox.com/profile/{username}',
    what_to_post: 'Rank, badges, machine completions — proves offensive security skill',
    api_available: false,
  },

  tryhackme: {
    id: 'tryhackme', name: 'TryHackMe', url: 'https://tryhackme.com',
    icon: '🔓', color: '#212c42',
    integration: 'deep_link',
    signupUrl: 'https://tryhackme.com/register',
    profileUrlTemplate: 'https://tryhackme.com/p/{username}',
    what_to_post: 'Badge, rank, room completions — entry-level security proof',
    api_available: false,
  },

  bugcrowd: {
    id: 'bugcrowd', name: 'Bugcrowd / HackerOne', url: 'https://bugcrowd.com',
    icon: '🐛', color: '#f26822',
    integration: 'deep_link',
    signupUrl: 'https://bugcrowd.com/user/sign_up',
    profileUrlTemplate: 'https://bugcrowd.com/{username}',
    what_to_post: 'Bug bounty hall of fame, CVE discoveries, earnings',
    api_available: false,
  },

  code4rena: {
    id: 'code4rena', name: 'Code4rena / Sherlock', url: 'https://code4rena.com',
    icon: '🏆', color: '#7c3aed',
    integration: 'deep_link',
    signupUrl: 'https://code4rena.com/',
    profileUrlTemplate: 'https://code4rena.com/@{username}',
    what_to_post: 'Audit contest results, leaderboard ranking, findings',
    api_available: false,
  },

  etherscan: {
    id: 'etherscan', name: 'Etherscan / Solscan', url: 'https://etherscan.io',
    icon: '⛓️', color: '#21325b',
    integration: 'link_only',
    signupUrl: 'https://etherscan.io/register',
    profileUrlTemplate: 'https://etherscan.io/address/{username}',
    what_to_post: 'Deployed contract addresses — on-chain verified proof of work',
    api_available: false,
  },

  mirror_xyz: {
    id: 'mirror_xyz', name: 'Mirror.xyz', url: 'https://mirror.xyz',
    icon: '🪞', color: '#007aff',
    integration: 'deep_link',
    signupUrl: 'https://mirror.xyz/',
    profileUrlTemplate: 'https://mirror.xyz/{username}',
    what_to_post: 'Web3-native writing, research, tokenomics analysis',
    api_available: false,
  },

  researchgate: {
    id: 'researchgate', name: 'ResearchGate', url: 'https://researchgate.net',
    icon: '🔬', color: '#00d0af',
    integration: 'package',
    signupUrl: 'https://www.researchgate.net/signup',
    profileUrlTemplate: 'https://researchgate.net/profile/{username}',
    what_to_post: 'Research papers, citations, h-index — essential for research roles',
    api_available: false,
    notes: 'No public API — app generates submission package',
  },

  arxiv: {
    id: 'arxiv', name: 'arXiv', url: 'https://arxiv.org',
    icon: '📄', color: '#b31b1b',
    integration: 'package',
    signupUrl: 'https://arxiv.org/user/register',
    profileUrlTemplate: 'https://arxiv.org/search/?searchtype=author&query={username}',
    what_to_post: 'Pre-print papers — AI/ML, quant finance, computational science',
    api_available: false,
    notes: 'Manual submission — app generates formatted cover letter + metadata',
  },

  personal_site: {
    id: 'personal_site', name: 'Personal Portfolio Site', url: '',
    icon: '🌐', color: '#6366f1',
    integration: 'link_only',
    signupUrl: 'https://github.com/pages',
    profileUrlTemplate: '{username}',
    what_to_post: 'Case studies, project showcases, blog — your owned platform',
    api_available: false,
  },

  figma_community: {
    id: 'figma_community', name: 'Figma Community', url: 'https://figma.com/community',
    icon: '🎯', color: '#f24e1e',
    integration: 'deep_link',
    signupUrl: 'https://www.figma.com/signup',
    profileUrlTemplate: 'https://figma.com/@{username}',
    what_to_post: 'Published Figma files, UI kits, component libraries, templates',
    api_available: false,
  },

  product_hunt: {
    id: 'product_hunt', name: 'Product Hunt', url: 'https://producthunt.com',
    icon: '🐱', color: '#da552f',
    integration: 'deep_link',
    signupUrl: 'https://www.producthunt.com/newsletter/login',
    profileUrlTemplate: 'https://producthunt.com/@{username}',
    what_to_post: 'Launch your apps and tools — maker credits visible to hiring teams',
    api_available: false,
  },

  devfolio: {
    id: 'devfolio', name: 'Devfolio / ETHGlobal', url: 'https://devfolio.co',
    icon: '🏗️', color: '#3770ff',
    integration: 'deep_link',
    signupUrl: 'https://devfolio.co/sign-up',
    profileUrlTemplate: 'https://devfolio.co/@{username}',
    what_to_post: 'Hackathon projects, prizes, live demos',
    api_available: false,
  },

  ssrn: {
    id: 'ssrn', name: 'SSRN', url: 'https://ssrn.com',
    icon: '📑', color: '#154360',
    integration: 'package',
    signupUrl: 'https://hq.ssrn.com/signup.cfm',
    profileUrlTemplate: 'https://ssrn.com/author={username}',
    what_to_post: 'Pre-print research — quant finance, legal, economics',
    api_available: false,
  },

  dbt_hub: {
    id: 'dbt_hub', name: 'dbt Hub', url: 'https://hub.getdbt.com',
    icon: '⚙️', color: '#ff694a',
    integration: 'deep_link',
    signupUrl: 'https://hub.getdbt.com/',
    profileUrlTemplate: 'https://hub.getdbt.com/',
    what_to_post: 'Open-source dbt packages — high signal for Analytics Engineering',
    api_available: false,
  },

  wandb: {
    id: 'wandb', name: 'Weights & Biases', url: 'https://wandb.ai',
    icon: '📡', color: '#ffbe00',
    integration: 'api_key',
    signupUrl: 'https://wandb.ai/signup',
    profileUrlTemplate: 'https://wandb.ai/{username}',
    what_to_post: 'ML training runs, experiment dashboards, model performance',
    api_available: true,
  },

  paperswithcode: {
    id: 'paperswithcode', name: 'Papers With Code', url: 'https://paperswithcode.com',
    icon: '📜', color: '#21cbce',
    integration: 'deep_link',
    signupUrl: 'https://paperswithcode.com/',
    profileUrlTemplate: 'https://paperswithcode.com/',
    what_to_post: 'Link research papers to code implementations',
    api_available: false,
  },

  zenodo: {
    id: 'zenodo', name: 'Zenodo', url: 'https://zenodo.org',
    icon: '🔭', color: '#1682d4',
    integration: 'api_key',
    signupUrl: 'https://zenodo.org/signup/',
    profileUrlTemplate: 'https://zenodo.org/search?q=creators.name%3A{username}',
    what_to_post: 'Scientific datasets, simulation code, open-source software with DOI',
    api_available: true,
  },

  grabcad: {
    id: 'grabcad', name: 'GrabCAD', url: 'https://grabcad.com',
    icon: '🔩', color: '#f26f21',
    integration: 'deep_link',
    signupUrl: 'https://grabcad.com/login#/',
    profileUrlTemplate: 'https://grabcad.com/library?utf8=%E2%9C%93&query={username}',
    what_to_post: '3D CAD models — mechanical, civil, structural engineering',
    api_available: false,
  },

  articulate_community: {
    id: 'articulate_community', name: 'Articulate Community', url: 'https://community.articulate.com',
    icon: '📐', color: '#e8672c',
    integration: 'deep_link',
    signupUrl: 'https://community.articulate.com/users/sign_up',
    profileUrlTemplate: 'https://community.articulate.com/users/{username}',
    what_to_post: 'Storyline/Rise eLearning samples — industry standard for Instructional Designers',
    api_available: false,
  },

  reliefweb: {
    id: 'reliefweb', name: 'ReliefWeb', url: 'https://reliefweb.int',
    icon: '🌍', color: '#009edb',
    integration: 'deep_link',
    signupUrl: 'https://reliefweb.int/user/register',
    profileUrlTemplate: 'https://reliefweb.int/user/{username}',
    what_to_post: 'Humanitarian sector CV, published situation reports, job applications',
    api_available: false,
  },

  contently: {
    id: 'contently', name: 'Contently / Muck Rack', url: 'https://contently.com',
    icon: '📝', color: '#1a73e8',
    integration: 'deep_link',
    signupUrl: 'https://contently.com/talent/',
    profileUrlTemplate: 'https://contently.com/{username}',
    what_to_post: 'Writing clips aggregated and verifiable — journalists and content strategists',
    api_available: false,
  },

  immunefi: {
    id: 'immunefi', name: 'Immunefi', url: 'https://immunefi.com',
    icon: '🛡️', color: '#00dc82',
    integration: 'deep_link',
    signupUrl: 'https://immunefi.com/',
    profileUrlTemplate: 'https://immunefi.com/bounty/',
    what_to_post: 'Bug bounty history, CVE discoveries on DeFi protocols',
    api_available: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIELD → PLATFORM MAPPINGS  (all 28 PDF fields + existing crypto/quant)
// ─────────────────────────────────────────────────────────────────────────────

export const FIELD_PLATFORMS: FieldPlatforms[] = [

  {
    fieldId: 'ai-ml',
    fieldName: 'AI & Machine Learning',
    emoji: '🤖',
    color: '#6366f1',
    hiringModel: 'MIXED',
    primaryPlatforms: ['github', 'huggingface', 'kaggle', 'paperswithcode', 'linkedin'],
    secondaryPlatforms: ['arxiv', 'wandb', 'medium', 'youtube'],
    fieldNotes: 'GitHub and Hugging Face are non-negotiable. Kaggle competition medals carry significant weight at interview. For research roles, arXiv pre-prints are expected.',
  },

  {
    fieldId: 'software-engineering',
    fieldName: 'Software Engineering',
    emoji: '💻',
    color: '#0ea5e9',
    hiringModel: 'MIXED',
    primaryPlatforms: ['github', 'linkedin', 'personal_site', 'stackoverflow'],
    secondaryPlatforms: ['medium', 'product_hunt', 'upwork', 'reddit'],
    fieldNotes: 'GitHub is your entire portfolio. A strong commit history, open-source contributions, and public projects matter more than a CV for most SWE roles.',
  },

  {
    fieldId: 'cloud-devops',
    fieldName: 'Cloud & DevOps',
    emoji: '☁️',
    color: '#0ea5e9',
    hiringModel: 'MIXED',
    primaryPlatforms: ['github', 'linkedin'],
    secondaryPlatforms: ['medium', 'youtube'],
    fieldNotes: 'IaC code (Terraform, Helm, Ansible), CI/CD pipelines on GitHub. LinkedIn for displaying AWS/Azure/GCP certification badges via Credly.',
  },

  {
    fieldId: 'cybersecurity',
    fieldName: 'Cybersecurity',
    emoji: '🛡️',
    color: '#ef4444',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['github', 'linkedin', 'hackthebox', 'tryhackme', 'bugcrowd'],
    secondaryPlatforms: ['personal_site', 'medium', 'twitter', 'youtube'],
    fieldNotes: 'HackTheBox and TryHackMe rankings are checked by hiring managers for pen test and SOC roles. CTF writeups on a personal blog are essential for offensive security.',
  },

  {
    fieldId: 'data-science',
    fieldName: 'Data Science',
    emoji: '📊',
    color: '#8b5cf6',
    hiringModel: 'GENERAL',
    primaryPlatforms: ['github', 'kaggle', 'linkedin', 'tableau_public'],
    secondaryPlatforms: ['medium', 'paperswithcode', 'youtube'],
    fieldNotes: 'Kaggle medals are the single most recognised credential in job applications. Kaggle Grandmaster status effectively substitutes for a degree at many companies.',
  },

  {
    fieldId: 'data-analysis-bi',
    fieldName: 'Data Analysis & Business Intelligence',
    emoji: '📈',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['tableau_public', 'linkedin', 'github'],
    secondaryPlatforms: ['medium', 'kaggle', 'personal_site'],
    fieldNotes: 'Tableau Public is the primary portfolio platform for BI/analyst roles. Always include real business impact metrics — not just pretty charts.',
  },

  {
    fieldId: 'data-engineering',
    fieldName: 'Data Engineering & Big Data',
    emoji: '⚙️',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['github', 'linkedin', 'dbt_hub'],
    secondaryPlatforms: ['medium', 'youtube'],
    fieldNotes: 'GitHub is non-negotiable. Pipeline code, dbt models, and Airflow DAGs are your portfolio. Publishing open-source dbt packages is very high signal.',
  },

  {
    fieldId: 'quantitative-finance',
    fieldName: 'Quantitative Finance',
    emoji: '⚡',
    color: '#6366f1',
    hiringModel: 'MIXED',
    primaryPlatforms: ['github', 'linkedin', 'quantconnect', 'ssrn'],
    secondaryPlatforms: ['kaggle', 'medium', 'arxiv'],
    fieldNotes: 'Jane Street, Citadel, and Two Sigma care about GitHub and Kaggle quant competition results (Optiver, Jane Street). QuantConnect shareable backtest results are respected across the industry.',
  },

  {
    fieldId: 'product-design',
    fieldName: 'Product & Design',
    emoji: '🎨',
    color: '#ec4899',
    hiringModel: 'MIXED',
    primaryPlatforms: ['behance', 'dribbble', 'linkedin'],
    secondaryPlatforms: ['figma_community', 'personal_site', 'product_hunt', 'medium', 'instagram'],
    fieldNotes: 'Behance for full case studies with process and rationale. Dribbble for visual shots. PM roles: LinkedIn + Notion case studies showing problem → research → decision → outcome.',
  },

  {
    fieldId: 'digital-marketing',
    fieldName: 'Digital Marketing',
    emoji: '📣',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['twitter', 'instagram', 'medium', 'upwork', 'youtube'],
    fieldNotes: 'Campaign case studies with hard metrics (CTR, ROAS, CAC) are what gets you hired. Certifications (Google Ads, Meta Blueprint, HubSpot) live on LinkedIn.',
  },

  {
    fieldId: 'supply-chain',
    fieldName: 'Supply Chain & Operations',
    emoji: '🔗',
    color: '#0ea5e9',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['github', 'tableau_public', 'medium', 'upwork'],
    fieldNotes: 'Quantified outcomes are everything: cost saved, lead time reduced, inventory turns improved. APICS CSCP and CSCMP certifications displayed on LinkedIn matter greatly.',
  },

  {
    fieldId: 'fintech-blockchain',
    fieldName: 'Fintech & Blockchain',
    emoji: '₿',
    color: '#f7931a',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['github', 'linkedin', 'etherscan', 'code4rena', 'immunefi'],
    secondaryPlatforms: ['mirror_xyz', 'twitter', 'devfolio'],
    fieldNotes: 'For smart contract roles, deployed contract addresses on Etherscan are verifiable proof. Code4rena/Sherlock audit contest leaderboard ranking is increasingly recognised by protocols.',
  },

  {
    fieldId: 'renewable-energy',
    fieldName: 'Renewable Energy & Sustainability',
    emoji: '🌱',
    color: '#10b981',
    hiringModel: 'MIXED',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['researchgate', 'github', 'medium'],
    fieldNotes: 'Impact metrics are your portfolio: MW installed, CO2 reduced, cost savings delivered. LEED, CFA ESG, and TCFD certifications on LinkedIn. For engineering roles, technical papers on ResearchGate.',
  },

  {
    fieldId: 'project-management',
    fieldName: 'Project & Program Management',
    emoji: '📋',
    color: '#8b5cf6',
    hiringModel: 'MIXED',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['medium', 'youtube', 'upwork'],
    fieldNotes: 'PMP, Prince2, and Agile certifications on LinkedIn. Case studies showing: scope managed, team size, budget controlled, stakeholder complexity, on-time/on-budget outcome.',
  },

  {
    fieldId: 'healthcare-nonclinical',
    fieldName: 'Healthcare (Non-Clinical)',
    emoji: '🏥',
    color: '#ef4444',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'researchgate'],
    secondaryPlatforms: ['personal_site', 'medium'],
    fieldNotes: 'CCRP, RAC, and medical writing certifications are verified via LinkedIn. Published papers on PubMed and ClinicalTrials.gov listings as an investigator carry significant weight.',
  },

  {
    fieldId: 'legal-compliance',
    fieldName: 'Legal & Compliance',
    emoji: '⚖️',
    color: '#64748b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['ssrn', 'medium'],
    fieldNotes: 'CAMS (AML), CIPP/E (privacy), and bar admissions live on LinkedIn. Compliance framework implementations and anonymised policy samples form your work portfolio.',
  },

  {
    fieldId: 'human-resources',
    fieldName: 'Human Resources',
    emoji: '👥',
    color: '#ec4899',
    hiringModel: 'MIXED',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['medium', 'upwork'],
    fieldNotes: 'SHRM-CP/SCP and CIPD certifications on LinkedIn. Case studies with metrics: time-to-fill reduced by X%, retention improved by Y%, programmes launched, team size managed.',
  },

  {
    fieldId: 'sales-revenue',
    fieldName: 'Sales & Revenue',
    emoji: '💰',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['upwork', 'medium', 'youtube'],
    fieldNotes: 'Quota attainment percentages, deal sizes, revenue generated, and pipeline numbers go on LinkedIn. Case studies for solution/enterprise sales showing: problem, process, outcome.',
  },

  {
    fieldId: 'writing-content',
    fieldName: 'Writing & Content',
    emoji: '✍️',
    color: '#64748b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site', 'medium', 'contently'],
    secondaryPlatforms: ['upwork', 'fiverr', 'substack', 'twitter'],
    fieldNotes: 'Writing clips are your CV. Published samples across formats. Substack subscriber count and Medium follower count signal audience-building ability.',
  },

  {
    fieldId: 'creative-media',
    fieldName: 'Creative & Media',
    emoji: '🎬',
    color: '#8b5cf6',
    hiringModel: 'MIXED',
    primaryPlatforms: ['behance', 'dribbble', 'instagram', 'vimeo', 'youtube', 'artstation', 'soundcloud'],
    secondaryPlatforms: ['linkedin', 'fiverr', 'upwork'],
    fieldNotes: 'Platform depends entirely on discipline: Vimeo/YouTube for video, ArtStation for 3D/game art, SoundCloud for audio, Behance/Dribbble for design. Always have a showreel.',
  },

  {
    fieldId: 'specialized-engineering',
    fieldName: 'Specialized Engineering',
    emoji: '🔧',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'researchgate', 'personal_site'],
    secondaryPlatforms: ['github', 'grabcad', 'youtube'],
    fieldNotes: 'PE license and professional body membership (IMechE, ASCE, IEEE) on LinkedIn. GrabCAD for mechanical/structural 3D models. GitHub for simulation and analysis code.',
  },

  {
    fieldId: 'real-estate',
    fieldName: 'Real Estate & Construction',
    emoji: '🏗️',
    color: '#f59e0b',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['medium', 'youtube'],
    fieldNotes: 'MRICS, CCIM, and CFA certifications on LinkedIn. Investment case studies showing IRR, equity multiple, deal size. Construction PMs: Procore project history and on-time/on-budget record.',
  },

  {
    fieldId: 'education-technology',
    fieldName: 'Education Technology',
    emoji: '📚',
    color: '#6366f1',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site', 'articulate_community'],
    secondaryPlatforms: ['youtube', 'behance', 'upwork'],
    fieldNotes: 'Articulate Community sample projects are the industry standard portfolio for Instructional Designers. eLearning demos and training videos are expected by hiring managers.',
  },

  {
    fieldId: 'logistics-trade',
    fieldName: 'Logistics & Trade',
    emoji: '🚢',
    color: '#0ea5e9',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'personal_site'],
    secondaryPlatforms: ['medium', 'upwork'],
    fieldNotes: 'FIATA diploma, US CBP customs broker license, and CISCM certifications on LinkedIn. Case studies: trade lanes managed, volume handled, customs clearance record, cost savings.',
  },

  {
    fieldId: 'insurance-actuarial',
    fieldName: 'Insurance & Actuarial',
    emoji: '📉',
    color: '#6366f1',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'researchgate'],
    secondaryPlatforms: ['github', 'medium'],
    fieldNotes: 'CAS/SOA exam progress displayed on LinkedIn is the primary signal — fellowship status (FCAS/FSA) is a definitive credential. GitHub for R/Python actuarial models.',
  },

  {
    fieldId: 'public-sector-ngo',
    fieldName: 'Public Sector & NGO',
    emoji: '🌍',
    color: '#10b981',
    hiringModel: 'MIXED',
    primaryPlatforms: ['linkedin', 'reliefweb'],
    secondaryPlatforms: ['researchgate', 'ssrn', 'personal_site', 'medium'],
    fieldNotes: 'ReliefWeb CV is essential for humanitarian and development roles. M&E certifications, donor reports, and programme outcome metrics belong on LinkedIn.',
  },

  {
    fieldId: 'agriculture-tech',
    fieldName: 'Agriculture Technology',
    emoji: '🌾',
    color: '#10b981',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['linkedin', 'github'],
    secondaryPlatforms: ['researchgate', 'kaggle', 'medium', 'youtube'],
    fieldNotes: 'Emerging field — LinkedIn + GitHub are currently the primary portfolio channels. Remote sensing, GIS, and ML for agriculture are increasingly competitive specialisations.',
  },

  {
    fieldId: 'computational-science',
    fieldName: 'Computational Science',
    emoji: '🔬',
    color: '#8b5cf6',
    hiringModel: 'SPECIFIC',
    primaryPlatforms: ['github', 'arxiv', 'researchgate'],
    secondaryPlatforms: ['zenodo', 'huggingface', 'youtube'],
    fieldNotes: 'Publications and citations (h-index) are the primary credential. GitHub for simulation code. Zenodo for datasets with DOI. Hugging Face for computational biology models.',
  },

  // ── EXISTING FIELDS (already in app) ─────────────────────────────────────
  {
    fieldId: 'crypto-onboarding',
    fieldName: 'Crypto / Web3',
    emoji: '₿',
    color: '#f7931a',
    hiringModel: 'MIXED',
    primaryPlatforms: ['github', 'twitter', 'linkedin', 'etherscan'],
    secondaryPlatforms: ['mirror_xyz', 'reddit', 'instagram', 'devfolio'],
    fieldNotes: 'Twitter/X community presence is essential for all crypto roles — it is the industry operating platform. GitHub for code. On-chain contract addresses for developers.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getPlatformsForField(fieldId: string): {
  primary: PortfolioPlatform[];
  secondary: PortfolioPlatform[];
} {
  const field = FIELD_PLATFORMS.find(f => f.fieldId === fieldId);
  if (!field) return { primary: [], secondary: [] };
  return {
    primary: field.primaryPlatforms.map(id => PLATFORMS[id]).filter(Boolean),
    secondary: field.secondaryPlatforms.map(id => PLATFORMS[id]).filter(Boolean),
  };
}

export function getAllPlatformIds(): string[] {
  return Object.keys(PLATFORMS);
}

export function getPlatform(id: string): PortfolioPlatform | undefined {
  return PLATFORMS[id];
}
