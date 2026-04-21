/**
 * Sifter Skill_Up — useFeed hook
 * Manages monitored tracks, feed loading per section, and engagement.
 * Primary track auto-loaded from user context.
 * Additional tracks can be added via addMonitoredTrack().
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FeedItem, Comment, ReactionType,
  MonitoredTrack, UserFeedContext, TrackFeedConfig,
} from '../types/feed';
import { getTrackFeedConfig, ALL_MONITORABLE_TRACKS } from '../lib/trackFeedConfig';
import {
  fetchSectionItems, fetchComments,
  postComment, reactToItem, toggleBookmark,
} from '../lib/feedAggregator';

// ─── Storage ──────────────────────────────────────────────────────────────────

const MONITORED_TRACKS_KEY = '@sifter_monitored_tracks_v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionData {
  section: TrackFeedConfig['sections'][number];
  items: FeedItem[];
  loading: boolean;
}

export interface TrackFeedData {
  track: MonitoredTrack;
  config: TrackFeedConfig;
  sections: SectionData[];
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

  // Comments
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

        // Always include primary track first
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
        // Fallback to primary only
        const primary = ALL_MONITORABLE_TRACKS.find(t => t.id === context.primaryTrackId);
        if (primary) setMonitoredTracks([{ ...primary, isPrimary: true }]);
      }
    })();
  }, [context.primaryTrackId]);

  // ── Load feed for active track ──────────────────────────────────────────────

  const loadFeed = useCallback(async (trackId: string) => {
    const config = getTrackFeedConfig(trackId);
    if (!config) return;

    // Set loading skeletons
    setSections(config.sections.map(s => ({ section: s, items: [], loading: true })));
    setLoading(true);

    // Load all sections in parallel
    const results = await Promise.allSettled(
      config.sections.map(async section => {
        const items = await fetchSectionItems(trackId, section);
        return { section, items, loading: false };
      }),
    );

    setSections(
      results.map((result, i) =>
        result.status === 'fulfilled'
          ? result.value
          : { section: config.sections[i], items: [], loading: false },
      ),
    );
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
      return updated;
    });
  }, []);

  const removeMonitoredTrack = useCallback(async (trackId: string) => {
    setMonitoredTracks(prev => {
      const updated = prev.filter(t => t.id !== trackId || t.isPrimary);
      const ids = updated.filter(t => !t.isPrimary).map(t => t.id);
      AsyncStorage.setItem(MONITORED_TRACKS_KEY, JSON.stringify(ids)).catch(() => {});
      return updated;
    });
    // If removed track was active, switch to primary
    if (activeTrackId === trackId) {
      setActiveTrackId(context.primaryTrackId);
    }
  }, [activeTrackId, context.primaryTrackId]);

  // ── Comments ────────────────────────────────────────────────────────────────

  const loadComments = useCallback(async (feedItemId: string) => {
    setCommentsLoading(prev => ({ ...prev, [feedItemId]: true }));
    try {
      const items = await fetchComments(feedItemId);
      setComments(prev => ({ ...prev, [feedItemId]: items }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [feedItemId]: false }));
    }
  }, []);

  const submitComment = useCallback(async (
    feedItemId: string,
    content: string,
    parentId: string | null,
    imageUrl?: string,
  ) => {
    const newComment = await postComment(feedItemId, content, parentId, imageUrl);
    setComments(prev => ({
      ...prev,
      [feedItemId]: [newComment, ...(prev[feedItemId] ?? [])],
    }));
    // Increment comment count optimistically
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
    reactToItem(feedItemId, reaction);
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
    toggleBookmark(feedItemId);
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
