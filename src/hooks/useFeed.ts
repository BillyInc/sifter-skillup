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

const MONITORED_TRACKS_KEY = '@sifter_monitored_tracks_v1';
const BOOKMARKS_KEY = '@sifter_feed_bookmarks_v1';
const REACTIONS_KEY = '@sifter_feed_reactions_v1';
const COMMENTS_KEY_PREFIX = '@sifter_feed_comments_v1:';

type StoredReactions = Record<string, ReactionType | undefined>;

export interface SectionData {
  section: TrackFeedConfig['sections'][number];
  items: UiFeedItem[];
  loading: boolean;
}

export interface UseFeedReturn {
  monitoredTracks: MonitoredTrack[];
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  addMonitoredTrack: (track: MonitoredTrack) => Promise<void>;
  removeMonitoredTrack: (trackId: string) => Promise<void>;
  sections: SectionData[];
  loading: boolean;
  isUsingFallback: boolean;
  refresh: () => void;
  comments: Record<string, Comment[]>;
  commentsLoading: Record<string, boolean>;
  loadComments: (feedItemId: string) => Promise<void>;
  submitComment: (
    feedItemId: string,
    content: string,
    parentId: string | null,
    imageUrl?: string,
  ) => Promise<void>;
  react: (feedItemId: string, reaction: ReactionType) => void;
  bookmark: (feedItemId: string) => void;
}

function commentsKey(feedItemId: string) {
  return `${COMMENTS_KEY_PREFIX}${feedItemId}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function reconcileItem(item: UiFeedItem, bookmarkIds: Set<string>, storedReactions: StoredReactions): UiFeedItem {
  const storedReaction = storedReactions[item.id];
  const reactions = { ...item.reactions };

  if (storedReaction && storedReaction !== item.myReaction) {
    if (item.myReaction) {
      reactions[item.myReaction] = Math.max(0, (reactions[item.myReaction] ?? 0) - 1);
    }
    reactions[storedReaction] = (reactions[storedReaction] ?? 0) + 1;
  }

  return {
    ...item,
    isBookmarked: bookmarkIds.has(item.id) || item.isBookmarked,
    myReaction: storedReaction ?? item.myReaction,
    reactions,
  };
}

export function useFeed(context: UserFeedContext): UseFeedReturn {
  const [monitoredTracks, setMonitoredTracks] = useState<MonitoredTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string>(context.primaryTrackId);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});

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

    API.feedGetSubscriptions().catch(() => undefined);
  }, [context.primaryTrackId, context.primaryFieldId]);

  const loadFeed = useCallback(async (trackId: string) => {
    setSections(DEMO_SECTIONS.map(s => ({ section: s, items: [], loading: true })));
    setLoading(true);

    const [storedBookmarkIds, storedReactions] = await Promise.all([
      readJson<string[]>(BOOKMARKS_KEY, []),
      readJson<StoredReactions>(REACTIONS_KEY, {}),
    ]);

    let apiItems: Awaited<ReturnType<typeof API.feedGetItems>> = [];
    try {
      apiItems = await API.feedGetItems(trackId);
    } catch {
      apiItems = [];
    }

    let bookmarkIds = new Set(storedBookmarkIds);
    try {
      const remoteBookmarks = await API.feedGetBookmarks();
      const remoteIds = remoteBookmarks
        .map(entry => String((entry as any).post_id ?? (entry as any).postId ?? ''))
        .filter(Boolean);
      if (remoteIds.length > 0) {
        bookmarkIds = new Set([...storedBookmarkIds, ...remoteIds]);
        writeJson(BOOKMARKS_KEY, Array.from(bookmarkIds));
      }
    } catch {}

    const fallback = !Array.isArray(apiItems) || apiItems.length === 0;
    const sourceItems = fallback ? SEEDED_FEED_ITEMS : apiItems;
    const grouped = groupItemsIntoSections(sourceItems).map(section => ({
      ...section,
      items: section.items.map(item => reconcileItem(item, bookmarkIds, storedReactions)),
    }));

    setSections(grouped);
    setIsUsingFallback(fallback);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed(activeTrackId);
  }, [activeTrackId, loadFeed]);

  const refresh = useCallback(() => {
    loadFeed(activeTrackId);
  }, [activeTrackId, loadFeed]);

  const addMonitoredTrack = useCallback(async (track: MonitoredTrack) => {
    setMonitoredTracks(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      const updated = [...prev, { ...track, isPrimary: false }];
      const ids = updated.filter(t => !t.isPrimary).map(t => t.id);
      AsyncStorage.setItem(MONITORED_TRACKS_KEY, JSON.stringify(ids)).catch(() => {});
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

  const loadComments = useCallback(async (feedItemId: string) => {
    setCommentsLoading(prev => ({ ...prev, [feedItemId]: true }));
    const storedComments = await readJson<Comment[]>(commentsKey(feedItemId), []);
    setComments(prev => ({ ...prev, [feedItemId]: storedComments }));
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

    const nextComments = [newComment, ...(comments[feedItemId] ?? [])];
    setComments(prev => ({ ...prev, [feedItemId]: nextComments }));
    await writeJson(commentsKey(feedItemId), nextComments);

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

    API.feedAddComment(feedItemId, content).catch(() => undefined);
  }, [comments]);

  const react = useCallback((feedItemId: string, reaction: ReactionType) => {
    setSections(prev =>
      prev.map(sec => ({
        ...sec,
        items: sec.items.map(item => {
          if (item.id !== feedItemId) return item;
          const previousReaction = item.myReaction;
          const nextReaction = previousReaction === reaction ? undefined : reaction;
          const nextReactions = { ...item.reactions };

          if (previousReaction) {
            nextReactions[previousReaction] = Math.max(0, (nextReactions[previousReaction] ?? 0) - 1);
          }
          if (nextReaction) {
            nextReactions[nextReaction] = (nextReactions[nextReaction] ?? 0) + 1;
          }

          readJson<StoredReactions>(REACTIONS_KEY, {}).then(prevStored => {
            const updated = { ...prevStored, [feedItemId]: nextReaction };
            writeJson(REACTIONS_KEY, updated);
          }).catch(() => undefined);

          if (nextReaction) {
            API.feedReact(feedItemId, uiReactionToApi(nextReaction)).catch(() => undefined);
          }

          return {
            ...item,
            myReaction: nextReaction,
            reactions: nextReactions,
          };
        }),
      })),
    );
  }, []);

  const bookmark = useCallback((feedItemId: string) => {
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

    readJson<string[]>(BOOKMARKS_KEY, []).then(prevIds => {
      const nextIds = prevIds.includes(feedItemId)
        ? prevIds.filter(id => id !== feedItemId)
        : [...prevIds, feedItemId];
      writeJson(BOOKMARKS_KEY, nextIds);
    }).catch(() => undefined);

    API.feedToggleBookmark(feedItemId).catch(() => undefined);
  }, []);

  return {
    monitoredTracks,
    activeTrackId,
    setActiveTrackId,
    addMonitoredTrack,
    removeMonitoredTrack,
    sections,
    loading,
    isUsingFallback,
    refresh,
    comments,
    commentsLoading,
    loadComments,
    submitComment,
    react,
    bookmark,
  };
}
