/**
 * Sifter Skill_Up — useFeed hook
 *
 * Wired to the real backend at `/api/feed/*` via the `API.*` helpers in
 * `src/lib/api.ts`. The old per-section aggregator (which hit nonexistent
 * `/feed/*` endpoints) has been replaced with a single
 * `API.feedGetItems(trackId?)` call plus client-side grouping via
 * `groupItemsIntoSections()`.
 *
 * When the API returns no items (empty list, error, or offline) we fall back
 * to `SEEDED_FEED_ITEMS` so the Feed tab is never blank on demo day.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FeedItem as UiFeedItem, Comment, ReactionType,
  MonitoredTrack, UserFeedContext, TrackFeedConfig,
} from '../types/feed';
import { ALL_MONITORABLE_TRACKS } from '../lib/trackFeedConfig';
import { API } from '../lib/api';
import {
  groupItemsIntoSections, uiReactionToApi, DEMO_SECTIONS,
} from '../lib/feedAggregator';
import { SEEDED_FEED_ITEMS } from '../lib/feedFallback';

// ─── Storage ──────────────────────────────────────────────────────────────────

const MONITORED_TRACKS_KEY = '@sifter_monitored_tracks_v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionData {
  section: TrackFeedConfig['sections'][number];
  items: UiFeedItem[];
  loading: boolean;
}

export interface UseFeedReturn {
  // Monitored tracks
  monitoredTracks: MonitoredTrack[];
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  addMonitoredTrack: (track: MonitoredTrack) => Promise<void>;
  removeMonitoredTrack: (trackId: string) => Promise<void>;

  // Feed data for active track
  sections: SectionData[];
  loading: boolean;
  refresh: () => void;

  // Comments (no backend endpoint yet — local-only stubs)
  comments: Record<string, Comment[]>;
  commentsLoading: Record<string, boolean>;
  loadComments: (feedItemId: string) => Promise<void>;
  submitComment: (
    feedItemId: string,
    content: string,
    parentId: string | null,
    imageUrl?: string,
  ) => Promise<void>;

  // Engagement
  react: (feedItemId: string, reaction: ReactionType) => void;
  bookmark: (feedItemId: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFeed(context: UserFeedContext): UseFeedReturn {
  const [monitoredTracks, setMonitoredTracks] = useState<MonitoredTrack[]>([]);
  const [activeTrackId, setActiveTrackId]     = useState<string>(context.primaryTrackId);
  const [sections, setSections]               = useState<SectionData[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [comments, setComments]               = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});

  // ── Bootstrap monitored tracks ──────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(MONITORED_TRACKS_KEY);
        const saved: string[] = stored ? JSON.parse(stored) : [];

        const primary = ALL_MONITORABLE_TRACKS.find(t => t.id === context.primaryTrackId);
        const primaryTrack: MonitoredTrack = primary
          ? { ...primary, isPrimary: true }
          : {
              id: context.primaryTrackId,
              label: context.primaryTrackId,
              emoji: '📡',
              fieldId: context.primaryFieldId,
              accentColor: '#5B5FCF',
              isPrimary: true,
            };

        const additional = saved
          .filter(id => id !== context.primaryTrackId)
          .map(id => ALL_MONITORABLE_TRACKS.find(t => t.id === id))
          .filter((t): t is MonitoredTrack => Boolean(t));

        setMonitoredTracks([primaryTrack, ...additional]);
      } catch {
        const primary = ALL_MONITORABLE_TRACKS.find(t => t.id === context.primaryTrackId);
        if (primary) setMonitoredTracks([{ ...primary, isPrimary: true }]);
      }
    })();
    // Pull subscription list from backend; non-fatal if it fails.
    API.feedGetSubscriptions().catch(() => undefined);
  }, [context.primaryTrackId]);

  // ── Load feed for active track ──────────────────────────────────────────────

  const loadFeed = useCallback(async (trackId: string) => {
    // Placeholder skeleton sections while the request is in flight.
    setSections(DEMO_SECTIONS.map(s => ({ section: s, items: [], loading: true })));
    setLoading(true);

    let apiItems: Awaited<ReturnType<typeof API.feedGetItems>> = [];
    try {
      apiItems = await API.feedGetItems(trackId);
    } catch {
      apiItems = [];
    }

    const useFallback = !Array.isArray(apiItems) || apiItems.length === 0;
    const grouped = groupItemsIntoSections(useFallback ? SEEDED_FEED_ITEMS : apiItems);

    setSections(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed(activeTrackId);
  }, [activeTrackId, loadFeed]);

  const refresh = useCallback(() => {
    loadFeed(activeTrackId);
  }, [activeTrackId, loadFeed]);

  // ── Monitored track management ─────────────────────────────────────────────

  const addMonitoredTrack = useCallback(async (track: MonitoredTrack) => {
    setMonitoredTracks(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      const updated = [...prev, { ...track, isPrimary: false }];
      const ids = updated.filter(t => !t.isPrimary).map(t => t.id);
      AsyncStorage.setItem(MONITORED_TRACKS_KEY, JSON.stringify(ids)).catch(() => {});
      // Push to backend subscription endpoint; non-fatal on failure.
      API.feedSubscribe(updated.map(t => t.id)).catch(() => undefined);
      return updated;
    });
  }, []);

  const removeMonitoredTrack = useCallback(async (trackId: string) => {
    setMonitoredTracks(prev => {
      const updated = prev.filter(t => t.id !== trackId || t.isPrimary);
      const ids = updated.filter(t => !t.isPrimary).map(t => t.id);
      AsyncStorage.setItem(MONITORED_TRACKS_KEY, JSON.stringify(ids)).catch(() => {});
      API.feedSubscribe(updated.map(t => t.id)).catch(() => undefined);
      return updated;
    });
    if (activeTrackId === trackId) {
      setActiveTrackId(context.primaryTrackId);
    }
  }, [activeTrackId, context.primaryTrackId]);

  // ── Comments (local-only — no backend endpoint yet) ────────────────────────

  const loadComments = useCallback(async (feedItemId: string) => {
    setCommentsLoading(prev => ({ ...prev, [feedItemId]: true }));
    setComments(prev => (prev[feedItemId] ? prev : { ...prev, [feedItemId]: [] }));
    setCommentsLoading(prev => ({ ...prev, [feedItemId]: false }));
  }, []);

  const submitComment = useCallback(async (
    feedItemId: string,
    content: string,
    parentId: string | null,
    imageUrl?: string,
  ) => {
    const newComment: Comment = {
      id: `local-${Date.now()}`,
      feedItemId,
      parentId,
      author: { id: 'me', name: 'You', avatar: '' },
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      myUpvote: false,
    };
    setComments(prev => ({
      ...prev,
      [feedItemId]: [newComment, ...(prev[feedItemId] ?? [])],
    }));
    setSections(prev =>
      prev.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
          item.id === feedItemId
            ? { ...item, commentCount: item.commentCount + 1 }
            : item,
        ),
      })),
    );
  }, []);

  // ── Engagement ──────────────────────────────────────────────────────────────

  const react = useCallback((feedItemId: string, reaction: ReactionType) => {
    // Fire-and-forget to backend; optimistic UI update below.
    API.feedReact(feedItemId, uiReactionToApi(reaction)).catch(() => undefined);
    setSections(prev =>
      prev.map(sec => ({
        ...sec,
        items: sec.items.map(item => {
          if (item.id !== feedItemId) return item;
          const wasActive = item.myReaction === reaction;
          return {
            ...item,
            myReaction: wasActive ? undefined : reaction,
            reactions: {
              ...item.reactions,
              [reaction]: Math.max(0, item.reactions[reaction] + (wasActive ? -1 : 1)),
            },
          };
        }),
      })),
    );
  }, []);

  const bookmark = useCallback((feedItemId: string) => {
    API.feedReact(feedItemId, 'bookmark').catch(() => undefined);
    setSections(prev =>
      prev.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
          item.id === feedItemId
            ? { ...item, isBookmarked: !item.isBookmarked }
            : item,
        ),
      })),
    );
  }, []);

  return {
    monitoredTracks,
    activeTrackId,
    setActiveTrackId,
    addMonitoredTrack,
    removeMonitoredTrack,
    sections,
    loading,
    refresh,
    comments,
    commentsLoading,
    loadComments,
    submitComment,
    react,
    bookmark,
  };
}
