/**
 * Sifter Skill_Up — Feed Types
 * Track-agnostic base + track-specific metadata shapes.
 */

export type ReactionType = '🔥' | '💡' | '💰' | '📈' | '🎯' | '❤️';

export type FeedItemType =
  | 'news'              // general news (quant, supply chain)
  | 'research'          // research papers
  | 'ecosystem_news'    // crypto: official blog/announcement
  | 'ecosystem_data'    // crypto: TVL, on-chain metrics
  | 'governance'        // crypto: active proposals
  | 'campaign'          // crypto: protocol incentive
  | 'new_project'       // crypto: new protocol/dApp launch
  | 'market_sentiment'  // both: sentiment indicator / fear & greed
  | 'job'               // both: job posting
  | 'skill'             // both: new Sifter lab/lesson
  | 'community';        // crypto: curated X/Discord thread

export type FeedSection =
  // Crypto
  | 'ecosystem_news'
  | 'ecosystem_data'
  | 'governance'
  | 'campaigns'
  | 'new_projects'
  | 'market_sentiment'
  | 'jobs'
  | 'skills'
  | 'community'
  // Quant
  | 'market_news'
  | 'research'
  | 'market_data'
  // Supply Chain
  | 'industry_news'
  | 'ops_research'
  | 'tools'
  // Social
  | 'social_twitter'
  | 'social_medium'
  | 'social_instagram'
  | 'social_facebook';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  section: FeedSection;
  trackId: string;        // 'defi-research-analyst'
  fieldId: string;        // 'crypto'

  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;

  // Engagement
  reactions: Record<ReactionType, number>;
  myReaction?: ReactionType;
  commentCount: number;
  isBookmarked: boolean;

  // Type-specific metadata
  metadata:
    | NewsMetadata
    | ResearchMetadata
    | EcosystemDataMetadata
    | GovernanceMetadata
    | CampaignMetadata
    | NewProjectMetadata
    | MarketSentimentMetadata
    | JobMetadata
    | SkillMetadata
    | CommunityMetadata;
}

// ─── Metadata shapes ──────────────────────────────────────────────────────────

export interface NewsMetadata {
  imageUrl?: string;
  summary?: string;
}

export interface ResearchMetadata {
  authors: string[];
  journal?: string;
  pdfUrl?: string;
  abstract?: string;
}

export interface EcosystemDataMetadata {
  metric: string;           // 'TVL', 'Volume', 'Active Addresses'
  value: string;            // '$1.2B'
  change7d?: string;        // '+8%'
  change30d?: string;       // '+34%'
  protocols?: Array<{ name: string; value: string }>;
  externalUrl: string;
}

export interface GovernanceMetadata {
  proposalId: string;       // 'SNIP-14'
  status: 'active' | 'passed' | 'rejected';
  forPercentage: number;
  againstPercentage: number;
  endsAt: string;           // ISO date
  canVote: boolean;
  voteUrl?: string;
}

export interface CampaignMetadata {
  protocol: string;
  task: string;
  reward: string;
  participants: number;
  endsAt: string;
  isJoined: boolean;
  joinUrl?: string;
}

export interface NewProjectMetadata {
  protocol: string;
  category: string;         // 'DEX', 'Lending', 'Bridge', 'NFT'
  chain: string;            // 'Starknet', 'Base', 'Ethereum'
  tvl?: string;
  auditStatus: 'audited' | 'pending' | 'unaudited';
  launchDate: string;
  websiteUrl?: string;
}

export interface MarketSentimentMetadata {
  index: number;            // 0–100
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  previousIndex?: number;
  previousLabel?: string;
  change: string;           // '+12 from yesterday'
  source: string;           // 'Alternative.me', 'CNN Fear & Greed'
  assetClass: 'crypto' | 'equities' | 'both';
}

export interface JobMetadata {
  company: string;
  location: string;
  salaryRange?: string;
  applyBy?: string;
  remote: boolean;
  applyUrl?: string;
}

export interface SkillMetadata {
  lessonCount: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  labId?: string;
}

export interface CommunityMetadata {
  authorHandle: string;
  platform: 'twitter' | 'discord' | 'forum';
  likes: number;
  replies: number;
  threadUrl?: string;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  feedItemId: string;
  parentId: string | null;    // null = top-level
  author: {
    id: string;
    name: string;
    avatar: string;
    trackId?: string;
  };
  content: string;
  imageUrl?: string;           // user-uploaded image in comment
  createdAt: string;
  upvotes: number;
  myUpvote: boolean;
  replies?: Comment[];         // nested replies
}

// ─── Track monitoring ─────────────────────────────────────────────────────────

export interface MonitoredTrack {
  id: string;
  label: string;
  emoji: string;
  fieldId: string;
  accentColor: string;
  isPrimary: boolean;          // user's active learning track
}

export interface UserFeedContext {
  primaryTrackId: string;
  primaryFieldId: string;
  monitoredTrackIds: string[];
}

// ─── Feed config ──────────────────────────────────────────────────────────────

export interface TrackFeedSection {
  id: FeedSection;
  title: string;
  icon: string;
  source: 'rss' | 'api' | 'sifter' | 'curated' | 'social';
}

export interface TrackFeedConfig {
  trackId: string;
  fieldType: 'crypto' | 'quant' | 'supply-chain' | 'tech' | 'operations' | 'business' | 'science';
  sections: TrackFeedSection[];
}
