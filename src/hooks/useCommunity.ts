/**
 * useCommunity — All community state, realtime, and API logic.
 *
 * Handles:
 *  - Cursor-based infinite scroll (scales to millions of posts)
 *  - Supabase Realtime subscriptions (live likes, comments, notifications)
 *  - Feed algorithm: Following feed + Discover (trending by field/track)
 *  - @mention and #hashtag parsing
 *  - Reactions (6 types)
 *  - Report / block / mute
 *  - Private account enforcement
 *  - DM: user can only open their own inbox (no unsolicited messages)
 *  - Poll creation and voting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { offlineWrite, type EnqueueResult } from '../lib/offlineQueue';

import { API_BASE } from '../lib/config';

/**
 * offlineWrite resolves `{ queued: false }` (it does not throw) when nothing
 * was stored, e.g. there is no signed-in profile. Callers must not treat that
 * as success: roll back any optimistic change, then throw so the screen can
 * show its own error.
 */
function assertQueued(result: EnqueueResult, message: string): void {
  if (!result.queued) throw new Error(message);
}

let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {}
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReactionType = '❤️' | '🔥' | '💡' | '🏆' | '😂' | '👀';
export const REACTIONS: ReactionType[] = ['❤️', '🔥', '💡', '🏆', '😂', '👀'];

export interface Author {
  id:         string;
  name:       string;
  avatar:     string;
  track?:     string;
  field?:     string;
  guild?:     string;
  isPrivate?: boolean;
  isFollowing?: boolean;
  isBlocked?: boolean;
}

export interface Poll {
  question:   string;
  options:    Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  votedId?:   string;  // which option current user voted
  endsAt?:    string;
}

export interface Attachment {
  type:       'portfolio' | 'image';
  title?:     string;
  url?:       string;
  imageUri?:  string;
  badgeEarned?: string;
  trackName?:   string;
}

export interface Post {
  id:           string;
  author:       Author;
  content:      string;
  attachments?: Attachment[];
  poll?:        Poll;
  reactions:    Partial<Record<ReactionType, number>>;
  myReaction?:  ReactionType;
  comments:     number;
  quotes:       number;
  isBookmarked: boolean;
  quotedPost?:  Omit<Post, 'quotedPost'>;
  hashtags:     string[];
  mentions:     string[];
  createdAt:    string;
  isPinned?:    boolean;
}

export interface Comment {
  id:          string;
  author:      Author;
  content:     string;
  reactions:   Partial<Record<ReactionType, number>>;
  myReaction?: ReactionType;
  createdAt:   string;
  replies?:    Comment[];
}

export interface Notification {
  id:          string;
  type:        'reaction' | 'comment' | 'quote' | 'follow' | 'follow_request' | 'mention' | 'poll_ended' | 'guild_invite';
  actor:       Author;
  postId?:     string;
  postSnippet?: string;
  reaction?:   ReactionType;
  isRead:      boolean;
  createdAt:   string;
}

export interface TrendingTopic {
  tag:         string;
  postCount:   number;
  field?:      string;
}

export type FeedMode = 'following' | 'discover';

// ── Mention / hashtag parser ───────────────────────────────────────────────────

export function parseContent(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = (text.match(/#(\w+)/g) ?? []).map(t => t.slice(1).toLowerCase());
  const mentions = (text.match(/@(\w+)/g) ?? []).map(t => t.slice(1).toLowerCase());
  return { hashtags, mentions };
}

/** Render content with coloured @mentions and #hashtags */
export function highlightContent(text: string): Array<{ text: string; type: 'plain' | 'mention' | 'hashtag' }> {
  const parts: Array<{ text: string; type: 'plain' | 'mention' | 'hashtag' }> = [];
  const regex = /(@\w+|#\w+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), type: 'plain' });
    parts.push({ text: match[0], type: match[0].startsWith('@') ? 'mention' : 'hashtag' });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), type: 'plain' });
  return parts;
}

// ── Feed cursor pagination ────────────────────────────────────────────────────

interface FeedState {
  posts:       Post[];
  cursor:      string | null;  // ISO timestamp of oldest post — never use page numbers (doesn't scale)
  hasMore:     boolean;
  loading:     boolean;
  refreshing:  boolean;
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useCommunity(currentUserId: string, currentUserTrack?: string) {
  const [feedMode, setFeedMode] = useState<FeedMode>('following');
  const [feed, setFeed] = useState<FeedState>({ posts: [], cursor: null, hasMore: true, loading: false, refreshing: false });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const realtimeRef = useRef<any>(null);
  // Latest committed state, read when an optimistic change needs rolling back.
  const feedRef = useRef(feed);
  feedRef.current = feed;
  const notificationsRef = useRef({ notifications, unreadCount });
  notificationsRef.current = { notifications, unreadCount };

  // ── Load initial feed ───────────────────────────────────────────────────────

  const loadFeed = useCallback(async (refresh = false) => {
    setFeed(s => ({ ...s, loading: !refresh, refreshing: refresh }));
    try {
      const cursor = refresh ? null : feed.cursor;
      const params: Record<string, string> = {
        mode:   feedMode,
        userId: currentUserId,
        limit:  '20',
        ...(cursor ? { cursor } : {}),
        ...(currentUserTrack ? { track: currentUserTrack } : {}),
      };
      const qs = new URLSearchParams(params).toString();
      // Backend returns posts sorted newest-first, with next_cursor for pagination
      const res = await fetch(`${API_BASE}/api/community/feed?${qs}`, {
        headers: { Authorization: `Bearer ${await import('../lib/api').then(m => m.API.getToken())}` },
      });
      if (!res.ok) throw new Error('Feed load failed');
      const data = await res.json();
      const newPosts: Post[] = (data.posts ?? []).filter((p: Post) => !blockedIds.has(p.author.id) && !mutedIds.has(p.author.id));

      setFeed(s => ({
        posts:      refresh ? newPosts : [...s.posts, ...newPosts],
        cursor:     data.next_cursor ?? null,
        hasMore:    data.has_more ?? false,
        loading:    false,
        refreshing: false,
      }));
    } catch {
      setFeed(s => ({ ...s, loading: false, refreshing: false }));
    }
  }, [feedMode, currentUserId, currentUserTrack, blockedIds, mutedIds]);

  const loadMore = useCallback(() => {
    if (!feed.hasMore || feed.loading) return;
    loadFeed(false);
  }, [feed.hasMore, feed.loading, loadFeed]);

  const refresh = useCallback(() => loadFeed(true), [loadFeed]);

  // ── Reload when feed mode changes ───────────────────────────────────────────

  useEffect(() => { loadFeed(true); }, [feedMode]);

  // ── Trending topics ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
      const res = await fetch(`${API_BASE}/api/community/trending`);
        if (res.ok) { const d = await res.json(); setTrending(d.topics ?? []); }
      } catch {}
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000); // refresh trending every 5 min
    return () => clearInterval(t);
  }, []);

  // ── Supabase Realtime ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUserId || !supabase) return;

    // Subscribe to new posts in feed
    const postChannel = supabase
      .channel(`community:feed:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'posts',
        filter: `audience=eq.public`,
      }, payload => {
        const post = payload.new as Post;
        if (blockedIds.has(post.author?.id) || mutedIds.has(post.author?.id)) return;
        setFeed(s => ({ ...s, posts: [post, ...s.posts] }));
      })
      // Subscribe to reaction updates — live like/reaction counts
      .on('postgres_changes', {
        event:  '*',
        schema: 'sifter_dev',
        table:  'post_reactions',
      }, payload => {
        const { post_id, reaction_type, count } = payload.new as any;
        setFeed(s => ({
          ...s,
          posts: s.posts.map(p =>
            p.id === post_id
              ? { ...p, reactions: { ...p.reactions, [reaction_type]: count } }
              : p
          ),
        }));
      })
      .subscribe();

    // Subscribe to personal notifications
    const notifChannel = supabase
      .channel(`notifications:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'notifications',
        filter: `recipient_id=eq.${currentUserId}`,
      }, payload => {
        const notif = payload.new as Notification;
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(n => n + 1);
        if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      })
      .subscribe();

    realtimeRef.current = { postChannel, notifChannel };
    return () => {
      if (!supabase) return;
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [currentUserId, blockedIds, mutedIds]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const react = useCallback(async (postId: string, reaction: ReactionType) => {
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const before = feedRef.current.posts.find(p => p.id === postId);
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => {
        if (p.id !== postId) return p;
        const removing = p.myReaction === reaction;
        const prev = p.reactions ?? {};
        const oldReaction = p.myReaction;
        const updated = { ...prev };
        if (oldReaction) updated[oldReaction] = Math.max(0, (updated[oldReaction] ?? 1) - 1);
        if (!removing) updated[reaction] = (updated[reaction] ?? 0) + 1;
        return { ...p, reactions: updated, myReaction: removing ? undefined : reaction };
      }),
    }));
    const result = await offlineWrite('/api/posts/react', 'POST', { postId, reaction }, 'normal');
    if (!result.queued) {
      if (before) {
        setFeed(s => ({
          ...s,
          posts: s.posts.map(p => p.id === postId
            ? { ...p, reactions: before.reactions, myReaction: before.myReaction }
            : p),
        }));
      }
      assertQueued(result, 'Could not save your reaction. Please sign in again and retry.');
    }
  }, []);

  const submitPost = useCallback(async (params: {
    content:      string;
    quotedPostId?: string;
    poll?:        { question: string; options: string[]; durationHours?: number };
    imageUri?:    string;
  }) => {
    const { hashtags, mentions } = parseContent(params.content);
    const optimistic: Post = {
      id:          `temp_${Date.now()}`,
      author:      { id: currentUserId, name: 'You', avatar: '👤', track: currentUserTrack },
      content:     params.content,
      reactions:   {},
      comments:    0,
      quotes:      0,
      isBookmarked: false,
      hashtags,
      mentions,
      createdAt:   new Date().toISOString(),
    };
    if (params.poll) {
      optimistic.poll = {
        question:   params.poll.question,
        options:    params.poll.options.map((t, i) => ({ id: String(i), text: t, votes: 0 })),
        totalVotes: 0,
      };
    }
    setFeed(s => ({ ...s, posts: [optimistic, ...s.posts] }));
    if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await offlineWrite('/api/posts', 'POST', { ...params, hashtags, mentions }, 'high');
    if (!result.queued) {
      // Nothing was saved (no signed-in profile): take the optimistic post back
      // and let the caller show the failure instead of losing it silently.
      setFeed(s => ({ ...s, posts: s.posts.filter(p => p.id !== optimistic.id) }));
      throw new Error('Could not save your post. Please sign in again and retry.');
    }
  }, [currentUserId, currentUserTrack]);

  const votePoll = useCallback(async (postId: string, optionId: string) => {
    const before = feedRef.current.posts.find(p => p.id === postId)?.poll;
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => {
        if (p.id !== postId || !p.poll) return p;
        const opts = p.poll.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
        return { ...p, poll: { ...p.poll, options: opts, totalVotes: p.poll.totalVotes + 1, votedId: optionId } };
      }),
    }));
    const result = await offlineWrite('/api/posts/vote', 'POST', { postId, optionId }, 'high');
    if (!result.queued) {
      if (before) {
        setFeed(s => ({ ...s, posts: s.posts.map(p => p.id === postId ? { ...p, poll: before } : p) }));
      }
      assertQueued(result, 'Could not save your vote. Please sign in again and retry.');
    }
  }, []);

  const bookmark = useCallback(async (postId: string, folderId?: string) => {
    const before = feedRef.current.posts.find(p => p.id === postId)?.isBookmarked;
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p),
    }));
    const result = await offlineWrite('/api/posts/bookmark', 'POST', { postId, folderId }, 'normal');
    if (!result.queued) {
      if (before !== undefined) {
        setFeed(s => ({ ...s, posts: s.posts.map(p => p.id === postId ? { ...p, isBookmarked: before } : p) }));
      }
      assertQueued(result, 'Could not save your bookmark. Please sign in again and retry.');
    }
  }, []);

  const reportPost = useCallback(async (postId: string, reason: string) => {
    const result = await offlineWrite('/api/moderation/report', 'POST', { postId, reason, reporterId: currentUserId }, 'high');
    // A report that was not stored must never look sent.
    assertQueued(result, 'Your report could not be saved. Please sign in again and retry.');
  }, [currentUserId]);

  const blockUser = useCallback(async (userId: string) => {
    const hadBlocked = blockedIds.has(userId);
    const removed = feedRef.current.posts;
    setBlockedIds(prev => new Set([...prev, userId]));
    setFeed(s => ({ ...s, posts: s.posts.filter(p => p.author.id !== userId) }));
    const result = await offlineWrite('/api/users/block', 'POST', { targetId: userId }, 'high');
    if (!result.queued) {
      if (!hadBlocked) setBlockedIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
      setFeed(s => {
        const have = new Set(s.posts.map(p => p.id));
        const restored = removed.filter(p => p.author.id === userId && !have.has(p.id));
        return { ...s, posts: [...s.posts, ...restored] };
      });
      assertQueued(result, 'Could not block this user. Please sign in again and retry.');
    }
  }, [blockedIds]);

  const muteUser = useCallback(async (userId: string) => {
    const hadMuted = mutedIds.has(userId);
    const removed = feedRef.current.posts;
    setMutedIds(prev => new Set([...prev, userId]));
    setFeed(s => ({ ...s, posts: s.posts.filter(p => p.author.id !== userId) }));
    const result = await offlineWrite('/api/users/mute', 'POST', { targetId: userId }, 'normal');
    if (!result.queued) {
      if (!hadMuted) setMutedIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
      setFeed(s => {
        const have = new Set(s.posts.map(p => p.id));
        const restored = removed.filter(p => p.author.id === userId && !have.has(p.id));
        return { ...s, posts: [...s.posts, ...restored] };
      });
      assertQueued(result, 'Could not mute this user. Please sign in again and retry.');
    }
  }, [mutedIds]);

  const followUser = useCallback(async (userId: string, isPrivate: boolean) => {
    // Private accounts get a follow REQUEST — public accounts get instant follow
    const action = isPrivate ? 'follow-request' : 'follow';
    const result = await offlineWrite(`/api/users/${action}`, 'POST', { targetId: userId }, 'normal');
    assertQueued(result, 'Could not follow this user. Please sign in again and retry.');
  }, []);

  const markNotificationsRead = useCallback(async () => {
    const before = notificationsRef.current;
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    const result = await offlineWrite('/api/notifications/read-all', 'POST', {}, 'normal');
    if (!result.queued) {
      setNotifications(before.notifications);
      setUnreadCount(before.unreadCount);
      assertQueued(result, 'Could not mark notifications as read. Please sign in again and retry.');
    }
  }, []);

  // ── Search ──────────────────────────────────────────────────────────────────

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/community/search?q=${encodeURIComponent(q)}&userId=${currentUserId}`,
        { headers: { Authorization: `Bearer ${await import('../lib/api').then(m => m.API.getToken())}` } }
      );
      if (res.ok) { const d = await res.json(); setSearchResults(d.posts ?? []); }
    } catch {} finally { setSearchLoading(false); }
  }, [currentUserId]);

  // Load notifications once
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
        `${API_BASE}/api/notifications?userId=${currentUserId}`,
          { headers: { Authorization: `Bearer ${await import('../lib/api').then(m => m.API.getToken())}` } }
        );
        if (res.ok) {
          const d = await res.json();
          setNotifications(d.notifications ?? []);
          setUnreadCount((d.notifications ?? []).filter((n: Notification) => !n.isRead).length);
        }
      } catch {}
    };
    if (currentUserId) load();
  }, [currentUserId]);

  return {
    // Feed
    feed, feedMode, setFeedMode, loadMore, refresh,
    // Actions
    react, submitPost, votePoll, bookmark,
    reportPost, blockUser, muteUser, followUser,
    // Notifications
    notifications, unreadCount, markNotificationsRead,
    // Discovery
    trending,
    // Search
    searchQuery, setSearchQuery, search, searchResults, searchLoading,
    // Utils
    blockedIds, mutedIds,
  };
}

// ── DM — user-initiated only ──────────────────────────────────────────────────
//
// Design decision: no unsolicited DMs. A user can only open their own inbox.
// Others cannot "slide into your DMs" — you have to tap their profile and
// choose to message them. This eliminates harassment and spam at the UX level.

export interface DMThread {
  id:            string;
  participant:   Author;
  lastMessage:   string;
  lastAt:        string;
  unread:        number;
}

export interface DMMessage {
  id:        string;
  senderId:  string;
  content:   string;
  createdAt: string;
  isRead:    boolean;
}

export function useDMs(currentUserId: string) {
  const [threads, setThreads] = useState<DMThread[]>([]);
  const [loading, setLoading] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/dms/threads`,
        { headers: { Authorization: `Bearer ${await import('../lib/api').then(m => m.API.getToken())}` } }
      );
      if (res.ok) { const d = await res.json(); setThreads(d.threads ?? []); }
    } catch {} finally { setLoading(false); }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    const result = await offlineWrite('/api/dms/send', 'POST', {
      senderId: currentUserId,
      recipientId,
      content,
    }, 'high');
    // A message that was not stored was not sent: tell the caller so it keeps
    // the text in the composer instead of showing it as delivered.
    assertQueued(result, 'Your message could not be saved. Please sign in again and retry.');
  }, [currentUserId]);

  // Realtime for DMs
  useEffect(() => {
    if (!currentUserId || !supabase) return;
    const channel = supabase
      .channel(`dms:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'dm_messages',
        filter: `recipient_id=eq.${currentUserId}`,
      }, () => { loadThreads(); })
      .subscribe();
    return () => {
      if (!supabase) return;
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadThreads]);

  return { threads, loading, loadThreads, sendMessage };
}
