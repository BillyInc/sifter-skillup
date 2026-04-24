/**
 * Sifter Skill_Up — Feed grouping utility
 *
 * Demoted from a fetch/aggregation layer to a *pure* client-side grouping helper.
 * All HTTP access now goes through `API.feedGetItems / feedReact / feedSubscribe`
 * in `src/lib/api.ts` (pointed at the real `/api/feed/*` backend).
 *
 * Responsibilities:
 *   1. Map the flat backend `FeedItem` (types/api.ts) into the richer UI
 *      `FeedItem` (types/feed.ts) that FeedCard already knows how to render.
 *   2. Group the flat list into the 4 fixed demo sections below.
 *
 * Sections (fixed, chosen for demo day):
 *   - starknet_updates  → items whose track_id or title relate to Starknet
 *   - crypto_news       → general crypto / market news
 *   - career_tips       → jobs + career-oriented content
 *   - skills_learning   → Sifter labs/lessons + research/tutorials
 */

import type { FeedItem as ApiFeedItem, FeedReaction } from '../types/api';
import type {
  FeedItem as UiFeedItem,
  ReactionType,
  TrackFeedSection,
} from '../types/feed';

// ─── Fixed sections ───────────────────────────────────────────────────────────

export const DEMO_SECTIONS: TrackFeedSection[] = [
  { id: 'ecosystem_news' as const, title: '⚡ Starknet updates',  icon: '⚡', source: 'api' },
  { id: 'market_news'    as const, title: '📰 Crypto news',       icon: '📰', source: 'api' },
  { id: 'jobs'           as const, title: '💼 Career tips',        icon: '💼', source: 'api' },
  { id: 'skills'         as const, title: '🎓 Skills & learning',  icon: '🎓', source: 'api' },
];

export type DemoSectionId =
  | 'ecosystem_news'
  | 'market_news'
  | 'jobs'
  | 'skills';

// ─── Classifier ───────────────────────────────────────────────────────────────

function classifyItem(item: ApiFeedItem): DemoSectionId {
  const track = (item.track_id ?? '').toLowerCase();
  const title = (item.title ?? '').toLowerCase();
  const src   = (item.source ?? '').toLowerCase();
  const hay   = `${track} ${title} ${src}`;

  if (/\bstarknet|cairo|stark\b|sn-?\b|ekubo|madara|kakarot/.test(hay)) {
    return 'ecosystem_news';
  }
  if (/\bjob|career|hiring|role|internship|resume|cv\b/.test(hay)) {
    return 'jobs';
  }
  if (/\blesson|lab|course|tutorial|learn|skill|research|paper|guide\b/.test(hay)) {
    return 'skills';
  }
  return 'market_news';
}

// ─── API → UI mapper ──────────────────────────────────────────────────────────

function mapReactions(
  item: ApiFeedItem,
): { reactions: UiFeedItem['reactions']; myReaction?: ReactionType; isBookmarked: boolean } {
  // Backend tracks three counters (like / bookmark / share). The UI palette is
  // richer, so we surface the live counters on the three most relevant emojis
  // and leave the rest at zero. Works out fine visually.
  const reactions: UiFeedItem['reactions'] = {
    '🔥': item.like_count ?? 0,
    '💡': 0,
    '💰': 0,
    '📈': item.share_count ?? 0,
    '🎯': 0,
    '❤️': item.bookmark_count ?? 0,
  };

  let myReaction: ReactionType | undefined;
  if (item.myReaction === 'like')     myReaction = '🔥';
  else if (item.myReaction === 'share')    myReaction = '📈';
  else if (item.myReaction === 'bookmark') myReaction = '❤️';

  return {
    reactions,
    myReaction,
    isBookmarked: Boolean(item.isBookmarked) || item.myReaction === 'bookmark',
  };
}

export function apiItemToUiItem(item: ApiFeedItem): UiFeedItem {
  const sectionId = classifyItem(item);
  const { reactions, myReaction, isBookmarked } = mapReactions(item);

  return {
    id: String(item.id),
    // `type` drives which widget FeedCard renders; "news" + imageUrl falls
    // through to the default <NewsWidget />, which is what we want here.
    type: sectionId === 'skills' ? 'skill'
        : sectionId === 'jobs'   ? 'job'
        : 'news',
    section: sectionId,
    trackId: item.track_id ?? 'unknown',
    fieldId: item.track_id ?? 'unknown',
    title:   item.title,
    content: item.summary ?? '',
    source:  item.source ?? 'Sifter',
    sourceUrl: item.url,
    publishedAt: item.published_at,
    reactions,
    myReaction,
    commentCount: item.commentCount ?? 0,
    isBookmarked,
    metadata: { imageUrl: item.image_url ?? undefined, summary: item.summary ?? undefined } as any,
  };
}

// ─── UI reaction → API reaction ───────────────────────────────────────────────

export function uiReactionToApi(r: ReactionType): FeedReaction {
  if (r === '❤️') return 'bookmark';
  if (r === '📈') return 'share';
  return 'like';
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

export interface GroupedSection {
  section: TrackFeedSection;
  items: UiFeedItem[];
  loading: boolean;
}

export function groupItemsIntoSections(
  apiItems: ApiFeedItem[],
): GroupedSection[] {
  const buckets: Record<DemoSectionId, UiFeedItem[]> = {
    ecosystem_news: [],
    market_news:    [],
    jobs:           [],
    skills:         [],
  };

  for (const raw of apiItems) {
    const ui = apiItemToUiItem(raw);
    buckets[ui.section as DemoSectionId].push(ui);
  }

  return DEMO_SECTIONS.map(section => ({
    section,
    items: buckets[section.id as DemoSectionId] ?? [],
    loading: false,
  }));
}
