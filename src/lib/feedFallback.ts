/**
 * Sifter LevelUp — Feed seeded fallback
 *
 * Renders when `API.feedGetItems()` returns empty, errors, or the device is offline.
 * Shape matches the backend `FeedItem` from `src/types/api.ts`, so the same grouping
 * pipeline in `feedAggregator.ts` can consume these items identically to live data.
 */

import type { FeedItem as ApiFeedItem, ISODateString } from '../types/api';

// Rough, plausible fixed dates so "time ago" renders realistically on demo day.
const NOW = Date.now();
const hoursAgo = (h: number): ISODateString =>
  new Date(NOW - h * 3600 * 1000).toISOString() as unknown as ISODateString;

export const SEEDED_FEED_ITEMS: ApiFeedItem[] = [
  {
    id: 'seed-starknet-1' as ApiFeedItem['id'],
    track_id: 'starknet',
    title: 'Starknet v0.13 upgrade live — fees down ~50%',
    summary:
      'The latest Starknet protocol upgrade reduces L2 transaction fees and improves proof batching throughput.',
    url: 'https://www.starknet.io/blog',
    source: 'Starknet Foundation',
    image_url: 'https://picsum.photos/seed/starknet1/600/320',
    published_at: hoursAgo(3),
    is_published: true,
    like_count: 42,
    bookmark_count: 11,
    share_count: 5,
  },
  {
    id: 'seed-crypto-1' as ApiFeedItem['id'],
    track_id: 'crypto',
    title: 'BTC reclaims $70k as ETF inflows resume',
    summary:
      'Spot Bitcoin ETFs recorded their largest weekly net inflow of the quarter, pushing BTC back above $70k.',
    url: 'https://www.coindesk.com',
    source: 'CoinDesk',
    image_url: 'https://picsum.photos/seed/crypto1/600/320',
    published_at: hoursAgo(6),
    is_published: true,
    like_count: 88,
    bookmark_count: 20,
    share_count: 14,
  },
  {
    id: 'seed-career-1' as ApiFeedItem['id'],
    track_id: 'career',
    title: 'How to land your first Cairo developer role',
    summary:
      'A pragmatic checklist: portfolio repos, open-source contributions, and what Starknet teams actually look for.',
    url: 'https://www.sifter.xyz/blog/cairo-careers',
    source: 'Sifter Blog',
    image_url: 'https://picsum.photos/seed/career1/600/320',
    published_at: hoursAgo(18),
    is_published: true,
    like_count: 31,
    bookmark_count: 18,
    share_count: 3,
  },
  {
    id: 'seed-skill-1' as ApiFeedItem['id'],
    track_id: 'skill',
    title: 'New lab: Build a token swap on Starknet',
    summary:
      '30-minute hands-on lab covering AMM math, Cairo storage, and deploying to Sepolia testnet. +150 XP.',
    url: 'https://www.sifter.xyz/labs/starknet-swap',
    source: 'Sifter Labs',
    image_url: 'https://picsum.photos/seed/skill1/600/320',
    published_at: hoursAgo(26),
    is_published: true,
    like_count: 19,
    bookmark_count: 9,
    share_count: 2,
  },
  {
    id: 'seed-ecosystem-1' as ApiFeedItem['id'],
    track_id: 'starknet',
    title: 'Ekubo TVL crosses $120M milestone',
    summary:
      'Concentrated-liquidity DEX Ekubo is now the largest protocol on Starknet by TVL, surpassing $120M.',
    url: 'https://defillama.com/chain/Starknet',
    source: 'DeFiLlama',
    image_url: 'https://picsum.photos/seed/eco1/600/320',
    published_at: hoursAgo(40),
    is_published: true,
    like_count: 27,
    bookmark_count: 12,
    share_count: 4,
  },
];
