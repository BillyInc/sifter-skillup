/**
 * Sifter Skill_Up — Feed Aggregator v2
 * Social sections added: Twitter/X, Instagram, Facebook, Medium/Blogs.
 *
 * Backend env vars required:
 *   TWITTER_BEARER_TOKEN        — Twitter API v2
 *   INSTAGRAM_ACCESS_TOKEN      — Facebook Graph API
 *   FACEBOOK_PAGE_ACCESS_TOKEN  — Facebook Graph API
 *   EXPO_PUBLIC_API_URL         — Flask backend base URL
 */

import type { FeedItem, Comment, TrackFeedSection } from '../types/feed';
import { getTrackFeedConfig } from './trackFeedConfig';
import { getSourcesForTrack } from './sources';
import {
  getMediumRSSForField,
  getTwitterHandlesForTrack,
  getInstagramHandlesForField,
  getFacebookPagesForField,
  TRACK_TO_FIELD,
} from './socialSources';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.sifter.app';

// ─── Main router ──────────────────────────────────────────────────────────────

export async function fetchSectionItems(
  trackId: string,
  section: TrackFeedSection,
): Promise<FeedItem[]> {
  try {
    switch (section.source) {
      case 'rss':     return await fetchRSSSection(trackId, section.id);
      case 'api':     return await fetchAPISection(trackId, section.id);
      case 'sifter':  return await fetchSifterSkills(trackId);
      case 'curated': return await fetchCuratedSection(trackId, section.id);
      case 'social':  return await fetchSocialSection(trackId, section.id);
      default:        return [];
    }
  } catch {
    return [];
  }
}

// ─── RSS ──────────────────────────────────────────────────────────────────────

async function fetchRSSSection(trackId: string, sectionId: string): Promise<FeedItem[]> {
  const sources = getSourcesForTrack(trackId);
  if (!sources) return [];

  let rssUrls: string[] = [];

  if (['ecosystem_news','market_news','industry_news'].includes(sectionId)) {
    rssUrls = sources.news.filter(s => s.quality === 'primary').map(s => s.url);
  } else if (['research','ops_research'].includes(sectionId)) {
    rssUrls = sources.research.map(s => s.url);
  } else if (sectionId === 'jobs') {
    rssUrls = sources.jobs.filter(j => j.rssUrl).map(j => j.rssUrl!);
  } else if (sectionId === 'new_projects') {
    rssUrls = [...sources.news.slice(0, 2), ...sources.research.slice(0, 1)].map(s => s.url);
  } else if (sectionId === 'tools') {
    rssUrls = sources.news.slice(0, 3).map(s => s.url);
  }

  if (!rssUrls.length) return [];

  const res = await fetch(`${API_BASE}/feed/rss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: rssUrls, trackId, section: sectionId, limit: 10 }),
  });
  return res.ok ? res.json() : [];
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchAPISection(trackId: string, sectionId: string): Promise<FeedItem[]> {
  const config = getTrackFeedConfig(trackId);
  if (!config) return [];

  if (sectionId === 'ecosystem_data')   return fetchDeFiLlamaData(trackId);
  if (sectionId === 'governance')       return fetchSnapshotProposals(trackId);
  if (sectionId === 'campaigns')        return fetchCampaigns(trackId);
  if (sectionId === 'market_data')      return fetchMarketData(trackId);
  if (sectionId === 'jobs')             return fetchJobsRSS(trackId);

  if (sectionId === 'market_sentiment') {
    if (config.fieldType === 'crypto')      return fetchCryptoSentiment();
    if (config.fieldType === 'quant')       return fetchEquitiesSentiment();
    if (config.fieldType === 'operations')  return fetchSupplyChainSentiment();
    return fetchEquitiesSentiment();
  }
  return [];
}

// ─── Social ───────────────────────────────────────────────────────────────────

async function fetchSocialSection(trackId: string, sectionId: string): Promise<FeedItem[]> {
  const fieldId = TRACK_TO_FIELD[trackId] ?? trackId;

  if (sectionId === 'social_twitter') {
    const handles = getTwitterHandlesForTrack(trackId, fieldId);
    if (!handles.length) return [];
    const res = await fetch(`${API_BASE}/feed/social/twitter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handles, trackId, limit: 20 }),
    });
    return res.ok ? res.json() : [];
  }

  if (sectionId === 'social_medium') {
    // Medium + blogs have public RSS — route through RSS parser
    const rssUrls = getMediumRSSForField(fieldId);
    if (!rssUrls.length) return [];
    const res = await fetch(`${API_BASE}/feed/rss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: rssUrls, trackId, section: 'social_medium', limit: 10 }),
    });
    return res.ok ? res.json() : [];
  }

  if (sectionId === 'social_instagram') {
    const handles = getInstagramHandlesForField(fieldId);
    if (!handles.length) return [];
    const res = await fetch(`${API_BASE}/feed/social/instagram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handles, trackId, limit: 10 }),
    });
    return res.ok ? res.json() : [];
  }

  if (sectionId === 'social_facebook') {
    const pages = getFacebookPagesForField(fieldId);
    if (!pages.length) return [];
    const res = await fetch(`${API_BASE}/feed/social/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages, trackId, limit: 10 }),
    });
    return res.ok ? res.json() : [];
  }

  return [];
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function fetchDeFiLlamaData(trackId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'defillama', trackId }),
  });
  return res.ok ? res.json() : [];
}

async function fetchSnapshotProposals(trackId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'snapshot', trackId, status: 'active' }),
  });
  return res.ok ? res.json() : [];
}

async function fetchCampaigns(trackId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/campaigns/${trackId}`);
  return res.ok ? res.json() : [];
}

async function fetchMarketData(trackId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'market_data', trackId }),
  });
  return res.ok ? res.json() : [];
}

async function fetchCryptoSentiment(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=2');
    if (!res.ok) return [];
    const data     = await res.json();
    const current  = data.data[0];
    const previous = data.data[1];
    const change   = Number(current.value) - Number(previous.value);
    return [{
      id: `sentiment_crypto_${current.timestamp}`,
      type: 'market_sentiment', section: 'market_sentiment',
      trackId: 'crypto', fieldId: 'crypto',
      title:   `Crypto Fear & Greed: ${current.value_classification} (${current.value})`,
      content: `Index at ${current.value}/100 — ${change >= 0 ? '+' : ''}${change} from yesterday.`,
      source: 'Alternative.me', sourceUrl: 'https://alternative.me/crypto/fear-and-greed-index/',
      publishedAt: new Date(Number(current.timestamp) * 1000).toISOString(),
      reactions: { '🔥': 0, '💡': 0, '💰': 0, '📈': 0, '🎯': 0, '❤️': 0 },
      commentCount: 0, isBookmarked: false,
      metadata: {
        index: Number(current.value), label: current.value_classification as any,
        previousIndex: Number(previous.value), previousLabel: previous.value_classification,
        change: `${change >= 0 ? '+' : ''}${change} from yesterday`,
        source: 'Alternative.me', assetClass: 'crypto',
      },
    }];
  } catch { return []; }
}

async function fetchEquitiesSentiment(): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/sentiment/equities`);
  return res.ok ? res.json() : [];
}

async function fetchSupplyChainSentiment(): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/sentiment/supply-chain`);
  return res.ok ? res.json() : [];
}

async function fetchJobsRSS(trackId: string): Promise<FeedItem[]> {
  const sources = getSourcesForTrack(trackId);
  if (!sources) return [];
  const rssUrls = sources.jobs.filter(j => j.rssUrl).map(j => j.rssUrl!);
  if (!rssUrls.length) return [];
  const res = await fetch(`${API_BASE}/feed/rss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: rssUrls, trackId, section: 'jobs', limit: 8 }),
  });
  return res.ok ? res.json() : [];
}

export async function fetchSifterSkills(trackId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/sifter/${trackId}`);
  return res.ok ? res.json() : [];
}

async function fetchCuratedSection(trackId: string, sectionId: string): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/feed/curated/${trackId}/${sectionId}`);
  return res.ok ? res.json() : [];
}

// ─── Comments + engagement ────────────────────────────────────────────────────

export async function fetchComments(feedItemId: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/feed/comments/${feedItemId}`);
  return res.ok ? res.json() : [];
}

export async function postComment(
  feedItemId: string, content: string,
  parentId: string | null, imageUrl?: string,
): Promise<Comment> {
  const res = await fetch(`${API_BASE}/feed/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedItemId, content, parentId, imageUrl }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

export async function reactToItem(feedItemId: string, reaction: string): Promise<void> {
  await fetch(`${API_BASE}/feed/reactions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedItemId, reaction }),
  }).catch(() => {});
}

export async function toggleBookmark(feedItemId: string): Promise<void> {
  await fetch(`${API_BASE}/feed/bookmarks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedItemId }),
  }).catch(() => {});
}
