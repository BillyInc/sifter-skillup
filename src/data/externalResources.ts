/**
 * Sifter Skill_Up — External Resources
 * Curated per track. Turns the legal disclaimer into a feature.
 * Updated by the curriculum team as resources change.
 */

export interface ExternalResource {
  title: string;
  url: string;
  type: 'book' | 'community' | 'platform' | 'certification' | 'youtube' | 'mentor';
  free: boolean;
  description: string;
}

export interface TrackResources {
  trackId: string;
  trackName: string;
  resources: ExternalResource[];
}

export const EXTERNAL_RESOURCES: TrackResources[] = [
  {
    trackId: 'supply-chain-analyst',
    trackName: 'Supply Chain Analyst',
    resources: [
      { title: 'Supply Chain Management by Sunil Chopra', url: 'https://www.amazon.com/dp/0136258972', type: 'book', free: false, description: 'The definitive academic text used in top MBA programs' },
      { title: 'APICS (now ASCM)', url: 'https://www.ascm.org', type: 'certification', free: false, description: 'CSCP and CPIM certifications — gold standard credentials' },
      { title: 'r/supplychain', url: 'https://reddit.com/r/supplychain', type: 'community', free: true, description: 'Active community of practitioners sharing real problems' },
      { title: 'LinkedIn Supply Chain Groups', url: 'https://linkedin.com', type: 'community', free: true, description: 'Network with hiring managers and senior analysts' },
      { title: 'Kaggle (for supply chain datasets)', url: 'https://kaggle.com', type: 'platform', free: true, description: 'Practice on real supply chain datasets' },
      { title: 'CSCMP (Council of Supply Chain Management Professionals)', url: 'https://cscmp.org', type: 'community', free: false, description: 'Professional association with local roundtables' },
    ],
  },
  {
    trackId: 'quant-trading',
    trackName: 'Quantitative Trading',
    resources: [
      { title: 'Quantitative Trading by Ernest Chan', url: 'https://www.amazon.com/dp/1119800064', type: 'book', free: false, description: 'Practical guide to building quant strategies' },
      { title: 'QuantLib', url: 'https://quantlib.org', type: 'platform', free: true, description: 'Open-source library for quantitative finance' },
      { title: 'QuantConnect', url: 'https://quantconnect.com', type: 'platform', free: true, description: 'Backtesting platform with real market data' },
      { title: 'r/algotrading', url: 'https://reddit.com/r/algotrading', type: 'community', free: true, description: 'Community of algorithmic traders sharing strategies' },
      { title: 'Wilmott Forums', url: 'https://wilmott.com', type: 'community', free: true, description: 'Professional quant finance discussion forum' },
      { title: 'CFA Institute', url: 'https://cfainstitute.org', type: 'certification', free: false, description: 'CFA designation — most recognised finance credential' },
    ],
  },
  {
    trackId: 'software-engineering',
    trackName: 'Software Engineering',
    resources: [
      { title: 'Clean Code by Robert Martin', url: 'https://www.amazon.com/dp/0132350882', type: 'book', free: false, description: 'Foundation text for professional software craftsmanship' },
      { title: 'GitHub', url: 'https://github.com', type: 'platform', free: true, description: 'Build a portfolio, contribute to open source' },
      { title: 'LeetCode', url: 'https://leetcode.com', type: 'platform', free: true, description: 'Technical interview practice — essential for FAANG prep' },
      { title: 'Dev.to', url: 'https://dev.to', type: 'community', free: true, description: 'Developer community — write articles to build credibility' },
      { title: 'The Primeagen (YouTube)', url: 'https://youtube.com/@ThePrimeagen', type: 'youtube', free: true, description: 'Senior engineer from Netflix on real engineering practice' },
      { title: 'ADPList (find mentors)', url: 'https://adplist.org', type: 'mentor', free: true, description: 'Free 1:1 mentorship from senior engineers globally' },
    ],
  },
  {
    trackId: 'data-science',
    trackName: 'Data Science',
    resources: [
      { title: 'Kaggle', url: 'https://kaggle.com', type: 'platform', free: true, description: 'Compete on real datasets, build a portfolio' },
      { title: 'Hands-On ML by Aurélien Géron', url: 'https://www.amazon.com/dp/1098125975', type: 'book', free: false, description: 'Best practical ML text for Python practitioners' },
      { title: 'r/datascience', url: 'https://reddit.com/r/datascience', type: 'community', free: true, description: 'Industry professionals discussing real data science work' },
      { title: 'Google Data Analytics Certificate', url: 'https://grow.google/certificates/data-analytics', type: 'certification', free: false, description: 'Well-recognised entry-level credential' },
      { title: 'StatQuest (YouTube)', url: 'https://youtube.com/@statquest', type: 'youtube', free: true, description: 'Best visual explanations of statistics and ML concepts' },
      { title: 'ADPList (find mentors)', url: 'https://adplist.org', type: 'mentor', free: true, description: 'Free mentorship from senior data scientists' },
    ],
  },
];

// Default resources for any track not yet listed
export const DEFAULT_RESOURCES: ExternalResource[] = [
  { title: 'ADPList (free mentorship)', url: 'https://adplist.org', type: 'mentor', free: true, description: 'Free 1:1 mentorship from professionals in your target field' },
  { title: 'LinkedIn Learning', url: 'https://linkedin.com/learning', type: 'platform', free: false, description: 'Supplement with role-specific courses from industry experts' },
  { title: 'r/careerguidance', url: 'https://reddit.com/r/careerguidance', type: 'community', free: true, description: 'Career advice from real professionals' },
  { title: 'YouTube (search your role name)', url: 'https://youtube.com', type: 'youtube', free: true, description: 'Day-in-the-life videos and tutorial content for your target role' },
];

export function getResourcesForTrack(trackId: string): ExternalResource[] {
  const found = EXTERNAL_RESOURCES.find(r => r.trackId === trackId);
  return found?.resources ?? DEFAULT_RESOURCES;
}

export const RESOURCE_TYPE_LABELS: Record<ExternalResource['type'], string> = {
  book: '📚 Book', community: '👥 Community', platform: '💻 Platform',
  certification: '🏅 Certification', youtube: '▶️ YouTube', mentor: '🧑‍🏫 Find a Mentor',
};
